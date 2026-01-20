/*
 * 3D Print Price Calculator
 * Copyright (C) 2025 Rp Hobbyist
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
