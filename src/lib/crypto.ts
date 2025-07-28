import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : (() => {
      if (process.env.NODE_ENV !== 'production') {
        // Provide a default key for development to avoid breaking the app
        // Note: This key is not secure and should not be used in production.
        console.warn('ENCRYPTION_KEY is not set. Using a default, insecure key for development.');
        return Buffer.from('0'.repeat(64), 'hex');
      }
      throw new Error('ENCRYPTION_KEY is not set in environment variables.');
    })();

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('Invalid ENCRYPTION_KEY length. Must be 32 bytes (64 hex characters).');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

export function decrypt(encryptedText: string): string {
  try {
    const data = Buffer.from(encryptedText, 'hex');
    const iv = data.slice(0, IV_LENGTH);
    const authTag = data.slice(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = data.slice(IV_LENGTH + 16);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return a known safe value or re-throw, depending on desired error handling.
    // Returning an empty string prevents the iframe from loading a broken URL.
    return '';
  }
}
