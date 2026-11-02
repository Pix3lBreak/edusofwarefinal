/**
 * End-to-End Encryption (E2EE) Service using Web Crypto API
 * AES-GCM 256-bit with PBKDF2 key derivation
 */

const SALT = new TextEncoder().encode('EduControl-Secure-E2EE-Salt-2026');

export class CryptoService {
  private static cachedKey: CryptoKey | null = null;
  private static activePassphrase: string = 'ColegioSeguro2026!'; // Default institutional master key

  /**
   * Derives an AES-GCM key from a user passphrase
   */
  private static async getKey(passphrase: string): Promise<CryptoKey> {
    if (this.cachedKey && this.activePassphrase === passphrase) {
      return this.cachedKey;
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.cachedKey = derivedKey;
    this.activePassphrase = passphrase;
    return derivedKey;
  }

  /**
   * Sets the active master passphrase
   */
  public static setPassphrase(passphrase: string) {
    this.cachedKey = null;
    this.activePassphrase = passphrase;
  }

  public static getPassphrase(): string {
    return this.activePassphrase;
  }

  /**
   * Encrypts plain text or an object into an AES-GCM string (iv:ciphertext)
   */
  public static async encrypt(data: unknown, customPassphrase?: string): Promise<string> {
    try {
      const key = await this.getKey(customPassphrase || this.activePassphrase);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));

      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        encoded
      );

      const ivBase64 = btoa(String.fromCharCode(...iv));
      const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

      return `${ivBase64}:${cipherBase64}`;
    } catch (err) {
      console.error('Encryption failed:', err);
      return '';
    }
  }

  /**
   * Decrypts an AES-GCM string back into an object or string
   */
  public static async decrypt<T = any>(encryptedString: string, customPassphrase?: string): Promise<T | null> {
    try {
      if (!encryptedString || !encryptedString.includes(':')) {
        return null;
      }

      const [ivBase64, cipherBase64] = encryptedString.split(':');
      const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
      const ciphertext = new Uint8Array(atob(cipherBase64).split('').map(c => c.charCodeAt(0)));

      const key = await this.getKey(customPassphrase || this.activePassphrase);
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        ciphertext
      );

      const text = new TextDecoder().decode(decrypted);
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (err) {
      console.warn('Decryption failed (incorrect key or corrupted data):', err);
      return null;
    }
  }

  /**
   * Generates a SHA-256 fingerprint of the key
   */
  public static async getFingerprint(passphrase?: string): Promise<string> {
    const text = passphrase || this.activePassphrase;
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).slice(0, 8).join(':').toUpperCase();
  }
}
