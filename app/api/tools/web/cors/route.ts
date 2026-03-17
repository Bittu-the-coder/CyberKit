import { NextRequest, NextResponse } from 'next/server';
import { urlSchema } from '@/lib/validators/tools';
import { z } from 'zod';

const corsSchema = z.object({
  url: urlSchema,
  origin: z.string().optional().default('https://attacker.com'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = corsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { url, origin } = parsed.data;

    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        'User-Agent': 'CyberKit/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    const allowOrigin = response.headers.get('access-control-allow-origin') ?? undefined;
    const allowMethods = response.headers.get('access-control-allow-methods') ?? undefined;
    const allowHeaders = response.headers.get('access-control-allow-headers') ?? undefined;
    const allowCredentials = response.headers.get('access-control-allow-credentials') ?? undefined;
    const exposeHeaders = response.headers.get('access-control-expose-headers') ?? undefined;
    const maxAge = response.headers.get('access-control-max-age') ?? undefined;

    const wildcardOrigin = allowOrigin === '*';
    const credentialsWithWildcard = wildcardOrigin && allowCredentials?.toLowerCase() === 'true';

    return NextResponse.json({
      url,
      allowOrigin,
      allowMethods,
      allowHeaders,
      allowCredentials,
      exposeHeaders,
      maxAge,
      wildcardOrigin,
      credentialsWithWildcard,
    });
  } catch (err) {
    console.error('CORS check error:', err);
    return NextResponse.json({ error: 'Request failed: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}
