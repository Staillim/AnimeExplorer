// src/app/anime/[id]/actions.ts
'use server';

import { decrypt } from '@/lib/crypto';

export async function getDecryptedUrl(encryptedUrl: string): Promise<string> {
  // The decryption must happen on the server
  return decrypt(encryptedUrl);
}
