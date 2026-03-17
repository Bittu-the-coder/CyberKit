import { NextRequest, NextResponse } from 'next/server';
import { breachCheckSchema } from '@/lib/validators/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = breachCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const hibpKey = process.env.HIBP_API_KEY;

    if (!hibpKey) {
      return NextResponse.json(
        {
          email,
          breaches: [],
          note: 'HIBP API key not configured. Add HIBP_API_KEY to your environment variables. Visit https://haveibeenpwned.com/API/Key to get a key.',
        },
        { status: 200 }
      );
    }

    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': hibpKey,
          'User-Agent': 'CyberKit/1.0',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.status === 404) {
      return NextResponse.json({ email, breaches: [], count: 0 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `HIBP API returned ${response.status}` },
        { status: 502 }
      );
    }

    const breaches = await response.json();
    return NextResponse.json({ email, breaches, count: breaches.length });
  } catch (err) {
    console.error('Breach check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
