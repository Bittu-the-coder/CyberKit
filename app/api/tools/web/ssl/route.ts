import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { ScanResult } from '@/lib/db/models/ScanResult';
import { sslSchema } from '@/lib/validators/tools';
import { runSSLCheck } from '@/lib/tools/web/ssl';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sslSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await auth();
    const startTime = Date.now();
    const result = await runSSLCheck(parsed.data.hostname);
    const duration = Date.now() - startTime;

    if (session?.user && parsed.data.saveResult) {
      await dbConnect();
      const severity = result.expired ? 'high' : (result.daysRemaining ?? 999) < 30 ? 'medium' : 'info';
      await ScanResult.create({
        userId: (session.user as { id?: string }).id,
        toolName: 'ssl-inspector',
        target: parsed.data.hostname,
        result,
        status: result.error ? 'failed' : 'completed',
        severity,
        duration,
        input: { hostname: parsed.data.hostname },
      });
    }

    return NextResponse.json({ ...result, duration });
  } catch (err) {
    console.error('SSL check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
