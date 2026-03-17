import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { ScanResult } from '@/lib/db/models/ScanResult';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const toolName = searchParams.get('tool') ?? undefined;

    await dbConnect();

    const filter: Record<string, unknown> = {
      userId: (session.user as { id?: string }).id,
    };
    if (toolName) filter.toolName = toolName;

    const [results, total] = await Promise.all([
      ScanResult.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-result.raw')
        .lean(),
      ScanResult.countDocuments(filter),
    ]);

    return NextResponse.json({ results, total, page, limit });
  } catch (err) {
    console.error('Results fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await dbConnect();
    await ScanResult.deleteOne({
      _id: id,
      userId: (session.user as { id?: string }).id,
    });

    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete result error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
