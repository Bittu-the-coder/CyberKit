import * as crypto from 'crypto';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'sha3-256' | 'sha3-512';

export interface HashResult {
  input: string;
  algorithm: HashAlgorithm;
  hash: string;
}

export interface MultiHashResult {
  input: string;
  hashes: Record<HashAlgorithm, string>;
}

export function computeHash(input: string, algorithm: HashAlgorithm): HashResult {
  const hash = crypto.createHash(algorithm).update(input, 'utf8').digest('hex');
  return { input, algorithm, hash };
}

export function computeAllHashes(input: string): MultiHashResult {
  const algorithms: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'sha3-512'];
  const hashes = {} as Record<HashAlgorithm, string>;
  for (const alg of algorithms) {
    hashes[alg] = crypto.createHash(alg).update(input, 'utf8').digest('hex');
  }
  return { input, hashes };
}

export function generatePassword(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  const { length, uppercase, lowercase, numbers, symbols } = options;
  let charset = '';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

export function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64');
}

export function decodeBase64(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

export function encodeHex(input: string): string {
  return Buffer.from(input, 'utf8').toString('hex');
}

export function decodeHex(input: string): string {
  return Buffer.from(input, 'hex').toString('utf8');
}

export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrl(input: string): string {
  return decodeURIComponent(input);
}

export function encodeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeHtml(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export interface JwtAnalysisResult {
  valid: boolean;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature?: string;
  expired?: boolean;
  error?: string;
}

export function analyzeJwt(token: string): JwtAnalysisResult {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid JWT format: must have 3 parts' };
  }
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const expired = payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
    return {
      valid: true,
      header,
      payload,
      signature: parts[2],
      expired,
    };
  } catch (err) {
    return { valid: false, error: 'Failed to decode JWT parts' };
  }
}
