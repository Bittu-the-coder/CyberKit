import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    await dbConnect();

    const existing = await User.findOne({ $or: [{ email }, { username }] }).lean();
    if (existing) {
      return NextResponse.json(
        { error: 'Email or username already in use' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      username,
      passwordHash,
      profile: { displayName: username },
    });

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
