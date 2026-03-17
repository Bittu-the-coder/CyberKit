import { dbConnect } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();

  const blog = await Blog.findOne({ slug, published: true });

  if (!blog) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 bg-card px-4 py-2 border border-border rounded-lg hover:border-primary/50">
            <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        <header className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground pb-6 border-b border-border border-dashed">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{blog.author}</span>
              </div>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
        </header>

        {blog.thumbnail && (
            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border bg-muted">
                <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
            </div>
        )}

        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
            {blog.content.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
            ))}
        </div>

        <footer className="pt-8 mt-12 border-t border-border">
            <div className="flex items-center gap-3 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {blog.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs uppercase font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground border border-border/50">
                        {tag}
                    </span>
                ))}
            </div>
        </footer>
    </article>
  );
}
