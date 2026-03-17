import { dbConnect } from '@/lib/db/connect';
import { Course } from '@/lib/db/models/Course';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default async function CoursesPage() {
  await dbConnect();
  const coursesRaw = await Course.find().sort({ createdAt: -1 });

  // Serialize for client component crossing (if needed, though this is a server component)
  const courses = JSON.parse(JSON.stringify(coursesRaw));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Courses</h1>
        <p className="text-muted-foreground text-sm">
          Structured cybersecurity courses for all skill levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course: any) => (
          <div
            key={course._id}
            className="group bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all duration-300 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-accent/30 border border-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${levelColors[course.difficulty] || levelColors.beginner}`}>
                {course.difficulty}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{course.description}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-medium">
              <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border">
                <Clock className="h-3.5 w-3.5" />
                {course.totalDuration || '10'} hours
              </span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">
                  {course.totalLessons || course.modules?.length || '0'} lessons
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {course.tags?.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-accent/50 border border-border text-muted-foreground uppercase">
                  {tag}
                </span>
              ))}
            </div>

            <Link href={`/learning/courses/${course.slug}`}>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-accent/50 border border-border font-medium group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 text-sm">
                  Start Course <ChevronRight className="h-4 w-4" />
                </button>
            </Link>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed border-border text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-50 text-primary" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Courses Found</h3>
              <p className="text-sm">We are cooking up some new content. Check back soon!</p>
          </div>
      )}
    </div>
  );
}
