import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { NextRequest, NextResponse } from 'next/server';

// Get all blogs (admin view - includes unpublished)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (err) {
    console.error('Admin blogs GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new blog
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    if (body.published && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const blog = await Blog.create(body);

    return NextResponse.json(blog, { status: 201 });
  } catch (err) {
    console.error('Admin blogs POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update blog
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { blogId, ...updateData } = await req.json();
    if (!blogId) {
      return NextResponse.json({ error: 'Missing blogId' }, { status: 400 });
    }

    await dbConnect();

    if (updateData.published && !updateData.publishedAt) {
       updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(blogId, updateData, { new: true });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (err) {
    console.error('Admin blogs PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete blog
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: 'Missing blogId' }, { status: 400 });
    }

    await dbConnect();
    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    console.error('Admin blogs DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
