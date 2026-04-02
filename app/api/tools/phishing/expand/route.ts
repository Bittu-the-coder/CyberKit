import { NextRequest, NextResponse } from 'next/server';

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  try {
    return new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const target = normalizeUrl(body.url ?? '');
    if (!target) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const chain: string[] = [target.toString()];
    let current = target;

    for (let i = 0; i < 6; i += 1) {
      const response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'CyberKit-Link-Expander/1.0',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;

        const nextUrl = new URL(location, current);
        chain.push(nextUrl.toString());
        current = nextUrl;
        continue;
      }

      break;
    }

    return NextResponse.json({
      original: target.toString(),
      final: chain[chain.length - 1],
      chain,
      hops: chain.length - 1,
    });
  } catch (error) {
    console.error('Safe link expander error:', error);
    return NextResponse.json({ error: 'Unable to expand link' }, { status: 500 });
  }
}
