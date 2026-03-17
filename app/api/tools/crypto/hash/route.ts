import { NextRequest, NextResponse } from 'next/server';
import { hashSchema } from '@/lib/validators/tools';
import { computeAllHashes, computeHash } from '@/lib/tools/crypto/hash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = hashSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { input, algorithm } = parsed.data;

    if (algorithm) {
      return NextResponse.json(computeHash(input, algorithm));
    }

    return NextResponse.json(computeAllHashes(input));
  } catch (err) {
    console.error('Hash error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
