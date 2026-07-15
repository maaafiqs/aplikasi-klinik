import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// AES encryption settings for NIK
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'klinik-secure-nik-key-32-bytes!!'; // Must be 32 chars
const ALGORITHM = 'aes-256-cbc';

/**
 * Hash a password using bcryptjs
 * @param {string} password 
 * @returns {string} hashed password
 */
export function hashPassword(password) {
  if (!password) return password;
  return bcrypt.hashSync(password, 10);
}

/**
 * Compare a plaintext password with a bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean} matches
 */
export function comparePassword(password, hash) {
  if (!password || !hash) return false;
  // If the hash is not a bcrypt hash, do a plain string match (for unmigrated records)
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    return password === hash;
  }
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error("Password comparison failed:", err);
    return false;
  }
}

/**
 * Encrypt a text (e.g. NIK) using AES-256-CBC
 * @param {string} text 
 * @returns {string} encrypted text in iv_hex:ciphertext_hex format
 */
export function encrypt(text) {
  if (!text) return text;
  
  // If the text is already encrypted, don't encrypt again
  if (typeof text === 'string' && text.includes(':') && text.split(':').length === 2 && text.split(':')[0].length === 32) {
    return text;
  }

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
}

/**
 * Decrypt a text (e.g. NIK) using AES-256-CBC
 * @param {string} text 
 * @returns {string} decrypted plaintext text
 */
export function decrypt(text) {
  if (!text) return text;
  
  // If it's not in the iv_hex:ciphertext_hex format, assume it is plaintext
  if (typeof text !== 'string' || !text.includes(':')) {
    return text;
  }

  try {
    const parts = text.split(':');
    if (parts.length !== 2 || parts[0].length !== 32) {
      // Not a valid iv:encrypted format
      return text;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return text; // Return original if decryption fails to avoid breaking application
  }
}
