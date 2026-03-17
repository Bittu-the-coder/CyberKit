'use client';

import { useToast } from '@/hooks/use-toast';
import { ICourse } from '@/lib/db/models/Course';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not load courses.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/admin/courses?courseId=${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setCourses(courses.filter((c: any) => c._id !== courseId));
      toast({ title: 'Success', description: 'Course deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete course.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Course Management</h1>
          <p className="text-muted-foreground text-sm">Manage learning content and curricula.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course: any) => (
          <div key={course._id} className="bg-background border border-border rounded-lg p-5 flex flex-col hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-3">
               <div className="h-10 w-10 rounded-md bg-accent/50 border border-border flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded border bg-card border-border uppercase">
                {course.difficulty}
              </span>
            </div>
            <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{course.description}</p>

            <div className="flex gap-2 text-xs text-muted-foreground mb-4">
              <span className="bg-accent/30 px-2 py-1 rounded">{course.modules?.length || 0} Modules</span>
              <span className="bg-accent/30 px-2 py-1 rounded">{course.totalLessons || 0} Lessons</span>
            </div>

            <div className="flex justify-end gap-2 mt-auto pt-3 border-t border-border border-dashed">
              <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => deleteCourse(course._id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed border-border">
            No courses found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
