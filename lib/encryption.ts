import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// 32-byte key is required for AES-256. 
// For production, this MUST be set in environment variables (e.g. process.env.ENCRYPTION_KEY)
// For local dev, we provide a fallback (WARNING: Not secure for production)
const getKey = () => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length === 32) {
    return Buffer.from(envKey, 'utf-8');
  }
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }
  // Fallback dev key
  console.warn("WARNING: Using default dev encryption key. Set ENCRYPTION_KEY (32 chars) in production.");
  return Buffer.from("12345678901234567890123456789012", 'utf-8');
};

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data.");
  }
}
