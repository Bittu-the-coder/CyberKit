import { dbConnect } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { NextRequest, NextResponse } from 'next/server';

// Get public blogs
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1 });

    return NextResponse.json(blogs);
  } catch (err) {
    console.error('Public blogs GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
