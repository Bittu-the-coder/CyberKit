import { NextRequest, NextResponse } from 'next/server';
import { passwordGenSchema } from '@/lib/validators/tools';
import { generatePassword } from '@/lib/tools/crypto/hash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = passwordGenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const password = generatePassword(parsed.data);
    return NextResponse.json({ password, length: password.length });
  } catch (err) {
    console.error('Password gen error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
