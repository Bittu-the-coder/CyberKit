import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { ScanResult } from '@/lib/db/models/ScanResult';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as { id?: string }).id;

    const [user, scanCount] = await Promise.all([
      User.findById(userId).select('-passwordHash').lean(),
      ScanResult.countDocuments({ userId }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = user as Record<string, unknown>;
    return NextResponse.json({ ...userDoc, stats: { ...((userDoc.stats as Record<string, unknown>) ?? {}), totalScans: scanCount } });
  } catch (err) {
    console.error('User me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const allowedFields = ['profile', 'settings', 'apiKeys'];
    const update: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(
      (session.user as { id?: string }).id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-passwordHash').lean();

    return NextResponse.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
