import { z } from 'zod';

export const domainSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, 'Invalid domain name');

export const urlSchema = z
  .string()
  .min(3)
  .max(2048)
  .refine(
    (val) => {
      try {
        const url = val.startsWith('http') ? val : `https://${val}`;
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL' }
  );

export const ipOrDomainSchema = z
  .string()
  .min(1)
  .max(253)
  .refine((val) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return ipRegex.test(val) || domainRegex.test(val);
  }, 'Must be a valid IP address or domain name');

export const whoisSchema = z.object({
  target: domainSchema,
  saveResult: z.boolean().optional().default(true),
});

export const dnsSchema = z.object({
  domain: domainSchema,
  saveResult: z.boolean().optional().default(true),
});

export const headersSchema = z.object({
  url: urlSchema,
  saveResult: z.boolean().optional().default(true),
});

export const sslSchema = z.object({
  hostname: z.string().min(1).max(253),
  saveResult: z.boolean().optional().default(true),
});

export const hashSchema = z.object({
  input: z.string().min(1).max(100000),
  algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'sha3-512']).optional(),
});

export const passwordGenSchema = z.object({
  length: z.number().min(8).max(128).default(24),
  uppercase: z.boolean().default(true),
  lowercase: z.boolean().default(true),
  numbers: z.boolean().default(true),
  symbols: z.boolean().default(false),
});

export const encodeDecodeSchema = z.object({
  input: z.string().min(1).max(100000),
  operation: z.enum(['encode', 'decode']),
  format: z.enum(['base64', 'hex', 'url', 'html', 'jwt']),
});

export const portScanSchema = z.object({
  target: ipOrDomainSchema,
  ports: z.string().optional().default('1-1024'),
  saveResult: z.boolean().optional().default(true),
});

export const usernameSearchSchema = z.object({
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username format'),
});

export const breachCheckSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const cveSearchSchema = z.object({
  query: z.string().min(1).max(200),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
  limit: z.number().min(1).max(50).default(20),
});

export const subdomainEnumSchema = z.object({
  domain: domainSchema,
  saveResult: z.boolean().optional().default(true),
});
