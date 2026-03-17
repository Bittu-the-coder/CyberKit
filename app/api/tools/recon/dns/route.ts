import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { ScanResult } from '@/lib/db/models/ScanResult';
import { dnsSchema } from '@/lib/validators/tools';
import { runDnsEnum } from '@/lib/tools/recon/dns';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = dnsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await auth();
    const startTime = Date.now();
    const result = await runDnsEnum(parsed.data.domain);
    const duration = Date.now() - startTime;

    if (session?.user && parsed.data.saveResult) {
      await dbConnect();
      await ScanResult.create({
        userId: (session.user as { id?: string }).id,
        toolName: 'dns-enum',
        target: parsed.data.domain,
        result,
        status: result.error ? 'failed' : 'completed',
        severity: 'info',
        duration,
        input: { domain: parsed.data.domain },
      });
    }

    return NextResponse.json({ ...result, duration });
  } catch (err) {
    console.error('DNS enum error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
