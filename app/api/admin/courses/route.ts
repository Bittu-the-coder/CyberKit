import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db/connect';
import { Course } from '@/lib/db/models/Course';
import { NextRequest, NextResponse } from 'next/server';

// Get all courses (admin view)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const courses = await Course.find({}).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (err) {
    console.error('Admin courses GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new course
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();
    const course = await Course.create(body);

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error('Admin courses POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update course
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { courseId, ...updateData } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    await dbConnect();
    const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (err) {
    console.error('Admin courses PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete course
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    await dbConnect();
    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    console.error('Admin courses DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
