/**
 * Simple encryption/decryption for token storage.
 * In a production environment, you'd want more secure methods or server-side storage.
 */

// Simple encryption key - in production this should be handled on the server side
const ENCRYPTION_KEY = 'simple-encryption-key-for-demo-only';

/**
 * Encrypt sensitive data before storing in database
 * Using base64 encoding for simplicity in the browser
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    // In a real app, implement proper encryption
    // This is just a basic encoding for demo purposes
    return btoa(text);
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
}

/**
 * Decrypt data retrieved from database
 */
export function decrypt(text: string): string {
  if (!text) return '';
  
  try {
    // In a real app, implement proper decryption
    // This is just a basic decoding for demo purposes
    return atob(text);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
} 