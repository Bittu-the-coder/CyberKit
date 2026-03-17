import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { ScanResult } from '@/lib/db/models/ScanResult';
import { whoisSchema } from '@/lib/validators/tools';
import { runWhois } from '@/lib/tools/recon/whois';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = whoisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await auth();
    const startTime = Date.now();
    const result = await runWhois(parsed.data.target);
    const duration = Date.now() - startTime;

    if (session?.user && parsed.data.saveResult) {
      await dbConnect();
      await ScanResult.create({
        userId: (session.user as { id?: string }).id,
        toolName: 'whois',
        target: parsed.data.target,
        result,
        status: result.error ? 'failed' : 'completed',
        severity: 'info',
        duration,
        input: { target: parsed.data.target },
      });
    }

    return NextResponse.json({ ...result, duration });
  } catch (err) {
    console.error('WHOIS error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
