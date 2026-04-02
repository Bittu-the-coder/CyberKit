import { dbConnect } from '@/lib/db/connect';
import { Course } from '@/lib/db/models/Course';
import { ArrowLeft, ArrowRight, Award, BookOpen, ChevronRight, Clock, FileText, Medal, PlayCircle, Tags } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  const course = await Course.findOne({ slug });

  if (!course) {
    notFound();
  }

  // Calculate total lessons correctly
  const totalLessons = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="space-y-8 pb-12">
        {/* Navigation */}
        <Link href="/learning/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2 border border-border rounded-lg hover:border-primary/50 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background opacity-50 z-0" />

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap gap-3">
                        <span className="uppercase text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-primary">
                            {course.category}
                        </span>
                        <span className={`uppercase text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-full border ${
                            course.difficulty === 'advanced' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/10 text-green-400 border-green-500/30'
                        }`}>
                            {course.difficulty}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                        {course.title}
                    </h1>

                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                         <div className="flex items-center gap-2 text-foreground bg-background px-4 py-2 border border-border rounded-lg">
                             <Clock className="h-4 w-4 text-primary" /> {course.totalDuration || 5} Hours
                         </div>
                         <div className="flex items-center gap-2 text-foreground bg-background px-4 py-2 border border-border rounded-lg">
                             <BookOpen className="h-4 w-4 text-primary" /> {totalLessons} Lessons
                         </div>
                    </div>
                </div>

                <div className="w-full md:w-72 shrink-0 bg-background border border-border rounded-lg p-6 space-y-6">
                    <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                        <PlayCircle className="h-5 w-5" /> Start Learning
                    </button>

                    <div className="space-y-4 pt-4 border-t border-border border-dashed">
                         <h3 className="font-semibold text-sm flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                            <Medal className="h-4 w-4" /> Course Includes
                         </h3>
                         <ul className="space-y-3 text-sm font-medium">
                            <li className="flex items-center gap-3"><CheckIcon className="text-cyber-green" /> Hands-on Labs</li>
                            <li className="flex items-center gap-3"><CheckIcon className="text-cyber-green" /> Real-world Scenarios</li>
                            <li className="flex items-center gap-3"><CheckIcon className="text-cyber-green" /> Certificate of Completion</li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            <div className="lg:col-span-2 space-y-8">
                 {/* Course Content / Modules */}
                 <div>
                     <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Curriculum
                     </h2>

                     <div className="space-y-4">
                         {course.modules?.map((module: any, idx: number) => (
                             <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden group">
                                 <div className="p-5 bg-accent/30 border-b border-border flex justify-between items-center cursor-pointer hover:bg-accent/50 transition-colors">
                                     <h3 className="font-semibold text-lg flex items-center gap-3">
                                        <span className="text-muted-foreground font-mono text-sm">{(idx + 1).toString().padStart(2, '0')}</span>
                                        {module.title}
                                     </h3>
                                     <span className="text-xs font-semibold bg-background px-3 py-1 rounded-md border border-border">
                                         {module.lessons?.length || 0} Lessons
                                     </span>
                                 </div>
                                 <div className="divide-y divide-border/50">
                                     {module.lessons?.map((lesson: any, lidx: number) => (
                                         <div key={lidx} className="p-4 pl-12 flex items-center justify-between hover:bg-accent/20 transition-colors cursor-pointer">
                                             <div className="flex items-center gap-4">
                                                 <div className={`p-2 rounded-md ${lesson.type === 'video' ? 'bg-blue-500/10 text-blue-400' : lesson.type === 'quiz' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                                                     {lesson.type === 'video' ? <PlayCircle className="h-4 w-4" /> : lesson.type === 'quiz' ? <Award className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                 </div>
                                                 <span className="font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">{lesson.title}</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 {lesson.content && (
                                                     <span className="text-xs text-primary font-medium hover:underline flex items-center gap-1">Read <ChevronRight className="h-3 w-3" /></span>
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                     {(!module.lessons || module.lessons.length === 0) && (
                                         <div className="p-4 pl-12 text-sm text-muted-foreground italic">No lessons are published in this module yet.</div>
                                     )}
                                 </div>
                             </div>
                         ))}
                         {(!course.modules || course.modules.length === 0) && (
                             <div className="p-8 text-center bg-card border border-dashed border-border rounded-lg text-muted-foreground">
                                 No curriculum modules are available for this course yet.
                             </div>
                         )}
                     </div>
                 </div>
            </div>

            <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 pb-4 border-b border-border flex items-center gap-2">
                        <Tags className="h-5 w-5 text-primary" /> Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {course.tags?.map((tag: string) => (
                            <span key={tag} className="text-xs font-semibold uppercase px-3 py-1.5 bg-background border border-border rounded text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 pb-4 border-b border-border flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Prerequisites
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        {course.difficulty === 'beginner' && (
                            <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Basic understanding of computers and networks.</li>
                        )}
                        {course.difficulty === 'intermediate' && (
                            <>
                                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Solid understanding of networking and Linux basics.</li>
                                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Familiarity with basic scripting (Python/Bash).</li>
                            </>
                        )}
                        {course.difficulty === 'advanced' && (
                            <>
                                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Strong networking and system administration skills.</li>
                                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Previous experience with penetration testing tools.</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${className}`}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
