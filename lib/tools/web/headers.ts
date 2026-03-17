export interface HeadersResult {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  securityHeaders: SecurityHeaderAnalysis[];
  server?: string;
  technologies: string[];
  responseTime: number;
  error?: string;
}

export interface SecurityHeaderAnalysis {
  name: string;
  present: boolean;
  value?: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;
}

const SECURITY_HEADERS = [
  {
    name: 'Strict-Transport-Security',
    severity: 'high' as const,
    description: 'Enforces HTTPS connections to the server.',
    recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
  },
  {
    name: 'Content-Security-Policy',
    severity: 'high' as const,
    description: 'Helps prevent XSS attacks by controlling resource loading.',
    recommendation: 'Define a strict CSP policy appropriate for your application.',
  },
  {
    name: 'X-Frame-Options',
    severity: 'medium' as const,
    description: 'Prevents clickjacking attacks.',
    recommendation: 'Add: X-Frame-Options: DENY or SAMEORIGIN',
  },
  {
    name: 'X-Content-Type-Options',
    severity: 'medium' as const,
    description: 'Prevents MIME type sniffing.',
    recommendation: 'Add: X-Content-Type-Options: nosniff',
  },
  {
    name: 'Referrer-Policy',
    severity: 'low' as const,
    description: 'Controls how much referrer information is shared.',
    recommendation: 'Add: Referrer-Policy: no-referrer-when-downgrade',
  },
  {
    name: 'Permissions-Policy',
    severity: 'low' as const,
    description: 'Controls browser features available to the page.',
    recommendation: 'Add appropriate Permissions-Policy header.',
  },
  {
    name: 'X-XSS-Protection',
    severity: 'low' as const,
    description: 'Legacy XSS filter (mostly superseded by CSP).',
    recommendation: 'Add: X-XSS-Protection: 1; mode=block',
  },
];

function detectTechnologies(headers: Record<string, string>): string[] {
  const technologies: string[] = [];
  const server = headers['server'] ?? '';
  const powered = headers['x-powered-by'] ?? '';
  const via = headers['via'] ?? '';

  if (server.toLowerCase().includes('nginx')) technologies.push('Nginx');
  if (server.toLowerCase().includes('apache')) technologies.push('Apache');
  if (server.toLowerCase().includes('iis')) technologies.push('IIS');
  if (server.toLowerCase().includes('cloudflare')) technologies.push('Cloudflare');
  if (powered.toLowerCase().includes('php')) technologies.push('PHP');
  if (powered.toLowerCase().includes('asp.net')) technologies.push('ASP.NET');
  if (powered.toLowerCase().includes('express')) technologies.push('Express.js');
  if (powered.toLowerCase().includes('next.js')) technologies.push('Next.js');
  if (headers['cf-ray']) technologies.push('Cloudflare');
  if (headers['x-vercel-id']) technologies.push('Vercel');
  if (headers['x-amzn-requestid']) technologies.push('AWS');
  if (headers['x-cache']?.includes('CloudFront')) technologies.push('AWS CloudFront');

  return [...new Set(technologies)];
}

export async function runHeadersCheck(url: string): Promise<HeadersResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const startTime = Date.now();

  try {
    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });

    const responseTime = Date.now() - startTime;
    const rawHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      rawHeaders[key.toLowerCase()] = value;
    });

    const securityHeaders: SecurityHeaderAnalysis[] = SECURITY_HEADERS.map((sh) => {
      const headerKey = sh.name.toLowerCase();
      const value = rawHeaders[headerKey];
      return {
        name: sh.name,
        present: !!value,
        value,
        severity: value ? 'info' : sh.severity,
        description: sh.description,
        recommendation: value ? undefined : sh.recommendation,
      };
    });

    return {
      url: normalizedUrl,
      statusCode: response.status,
      statusText: response.statusText,
      headers: rawHeaders,
      securityHeaders,
      server: rawHeaders['server'],
      technologies: detectTechnologies(rawHeaders),
      responseTime,
    };
  } catch (err) {
    return {
      url: normalizedUrl,
      statusCode: 0,
      statusText: 'Error',
      headers: {},
      securityHeaders: [],
      technologies: [],
      responseTime: Date.now() - startTime,
      error: err instanceof Error ? err.message : 'Request failed',
    };
  }
}
