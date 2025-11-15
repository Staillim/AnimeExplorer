import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '@/lib/cache';

export function useCachedAnimes<T>(
  fetchFunction: () => Promise<T[]>,
  cacheKey: string = 'allAnimes',
  cacheTtlHours: number = 24
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener del caché
        const cachedData = await cacheService.getAnime(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        // Si no está en caché, obtener de Firebase
        const freshData = await fetchFunction();
        
        // Guardar en caché
        await cacheService.setAnime(cacheKey, freshData, cacheTtlHours);
        setData(freshData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cacheKey, cacheTtlHours, fetchFunction]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await cacheService.deleteAnime(cacheKey);
      const freshData = await fetchFunction();
      await cacheService.setAnime(cacheKey, freshData, cacheTtlHours);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [cacheKey, cacheTtlHours, fetchFunction]);

  return { data, loading, error, refresh };
}

export function useCachedImage(imageUrl: string, cacheTtlHours: number = 72) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Intentar obtener del caché
        const cachedBlob = await cacheService.getImage(imageUrl);
        if (cachedBlob) {
          const objectUrl = URL.createObjectURL(cachedBlob);
          setSrc(objectUrl);
          setLoading(false);
          return;
        }

        // Si no está en caché, descargar
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        
        // Guardar en caché
        await cacheService.setImage(imageUrl, blob, cacheTtlHours);
        
        const objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (error) {
        console.error('Error loading image:', error);
        setSrc(imageUrl); // Fallback a URL original
      } finally {
        setLoading(false);
      }
    };

    if (imageUrl) {
      fetchImage();
    }
  }, [imageUrl, cacheTtlHours]);

  return { src, loading };
}
