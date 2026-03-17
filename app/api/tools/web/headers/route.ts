import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { ScanResult } from '@/lib/db/models/ScanResult';
import { headersSchema } from '@/lib/validators/tools';
import { runHeadersCheck } from '@/lib/tools/web/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = headersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await auth();
    const result = await runHeadersCheck(parsed.data.url);

    if (session?.user && parsed.data.saveResult) {
      await dbConnect();
      const missingCritical = result.securityHeaders.filter(
        (h) => !h.present && (h.severity === 'high' || h.severity === 'medium')
      );
      const severity =
        missingCritical.some((h) => h.severity === 'high') ? 'high' :
        missingCritical.some((h) => h.severity === 'medium') ? 'medium' : 'info';

      await ScanResult.create({
        userId: (session.user as { id?: string }).id,
        toolName: 'http-headers',
        target: parsed.data.url,
        result,
        status: result.error ? 'failed' : 'completed',
        severity,
        input: { url: parsed.data.url },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Headers check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
