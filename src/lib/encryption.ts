/**
 * Simple encryption utilities for feedback messages
 * Uses Base64 encoding with a simple XOR cipher for obfuscation
 */

const ENCRYPTION_KEY = "PrintingPricePro2024SecretKey";

/**
 * Encrypt a message using XOR cipher and Base64 encoding
 */
export function encryptMessage(message: string): string {
    try {
        // XOR cipher
        const encrypted = message
            .split('')
            .map((char, i) => {
                const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
                return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
            })
            .join('');

        // Base64 encode
        return btoa(encrypted);
    } catch (error) {
        console.error('Encryption failed:', error);
        return btoa(message); // Fallback to simple Base64
    }
}

/**
 * Decrypt a message (for admin viewing)
 */
export function decryptMessage(encryptedMessage: string): string {
    try {
        // Base64 decode
        const decoded = atob(encryptedMessage);

        // XOR decipher
        const decrypted = decoded
            .split('')
            .map((char, i) => {
                const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
                return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
            })
            .join('');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return encryptedMessage;
    }
}
