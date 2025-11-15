// IndexedDB cache para optimizar consultas a Firebase
const DB_NAME = 'AnimeExplorerCache';
const DB_VERSION = 1;
const STORES = {
  ANIMES: 'animes',
  IMAGES: 'images',
};

interface CacheEntry {
  id: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

interface ImageCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  ttl: number;
}

let dbInstance: IDBDatabase | null = null;

const initDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear object store para animes
      if (!db.objectStoreNames.contains(STORES.ANIMES)) {
        const animeStore = db.createObjectStore(STORES.ANIMES, { keyPath: 'id' });
        animeStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Crear object store para imágenes
      if (!db.objectStoreNames.contains(STORES.IMAGES)) {
        const imageStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'url' });
        imageStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const isExpired = (timestamp: number, ttl: number): boolean => {
  return Date.now() - timestamp > ttl;
};

export const cacheService = {
  // ===== ANIME CACHE =====
  async setAnime(id: string, data: any, ttlHours: number = 24): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.ANIMES, 'readwrite').objectStore(STORES.ANIMES);
      const entry: CacheEntry = {
        id,
        data,
        timestamp: Date.now(),
        ttl: ttlHours * 60 * 60 * 1000,
      };
      await store.put(entry);
    } catch (error) {
      console.error('Error saving anime to cache:', error);
    }
  },

  async getAnime(id: string): Promise<any | null> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.ANIMES, 'readonly').objectStore(STORES.ANIMES);
      return new Promise((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const entry = request.result as CacheEntry | undefined;
          if (entry && !isExpired(entry.timestamp, entry.ttl)) {
            resolve(entry.data);
          } else {
            if (entry) {
              // Eliminar entrada expirada
              cacheService.deleteAnime(id);
            }
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting anime from cache:', error);
      return null;
    }
  },

  async deleteAnime(id: string): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.ANIMES, 'readwrite').objectStore(STORES.ANIMES);
      await store.delete(id);
    } catch (error) {
      console.error('Error deleting anime from cache:', error);
    }
  },

  async getAllAnimes(): Promise<any[]> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.ANIMES, 'readonly').objectStore(STORES.ANIMES);
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const entries = request.result as CacheEntry[];
          const validEntries = entries
            .filter((entry) => !isExpired(entry.timestamp, entry.ttl))
            .map((entry) => entry.data);
          resolve(validEntries);
        };
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting all animes from cache:', error);
      return [];
    }
  },

  async clearAnimes(): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.ANIMES, 'readwrite').objectStore(STORES.ANIMES);
      await store.clear();
    } catch (error) {
      console.error('Error clearing anime cache:', error);
    }
  },

  // ===== IMAGE CACHE =====
  async setImage(url: string, blob: Blob, ttlHours: number = 72): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.IMAGES, 'readwrite').objectStore(STORES.IMAGES);
      const entry: ImageCacheEntry = {
        url,
        blob,
        timestamp: Date.now(),
        ttl: ttlHours * 60 * 60 * 1000,
      };
      await store.put(entry);
    } catch (error) {
      console.error('Error saving image to cache:', error);
    }
  },

  async getImage(url: string): Promise<Blob | null> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.IMAGES, 'readonly').objectStore(STORES.IMAGES);
      return new Promise((resolve) => {
        const request = store.get(url);
        request.onsuccess = () => {
          const entry = request.result as ImageCacheEntry | undefined;
          if (entry && !isExpired(entry.timestamp, entry.ttl)) {
            resolve(entry.blob);
          } else {
            if (entry) {
              cacheService.deleteImage(url);
            }
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting image from cache:', error);
      return null;
    }
  },

  async deleteImage(url: string): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.IMAGES, 'readwrite').objectStore(STORES.IMAGES);
      await store.delete(url);
    } catch (error) {
      console.error('Error deleting image from cache:', error);
    }
  },

  async clearImages(): Promise<void> {
    try {
      const db = await initDB();
      const store = db.transaction(STORES.IMAGES, 'readwrite').objectStore(STORES.IMAGES);
      await store.clear();
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  },

  async getCacheStats(): Promise<{ animes: number; images: number }> {
    try {
      const db = await initDB();

      const animeCount = await new Promise<number>((resolve) => {
        const request = db.transaction(STORES.ANIMES, 'readonly').objectStore(STORES.ANIMES).count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });

      const imageCount = await new Promise<number>((resolve) => {
        const request = db.transaction(STORES.IMAGES, 'readonly').objectStore(STORES.IMAGES).count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });

      return { animes: animeCount, images: imageCount };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { animes: 0, images: 0 };
    }
  },
};

// Service Worker para cache de red
export const setupNetworkCache = () => {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
};
