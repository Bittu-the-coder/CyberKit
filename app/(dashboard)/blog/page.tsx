'use client';

import { useToast } from '@/hooks/use-toast';
import { IBlog } from '@/lib/db/models/Blog';
import { ArrowRight, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not load the blog feed.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading latest articles...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 py-8 bg-card border border-border rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground relative z-10">CyberKit Security Blog</h1>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto relative z-10 px-4">
          Stay updated with the latest in cybersecurity, tool releases, and deep-dive technical articles written by our expert community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link href={`/blog/${blog.slug}`} key={blog._id as unknown as string} className="group flex flex-col h-full">
            <article className="flex flex-col h-full bg-card hover:bg-accent/5 transition-all duration-300 border border-border rounded-lg overflow-hidden group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.1)]">
              {blog.thumbnail ? (
                  <div className="h-48 w-full bg-muted overflow-hidden">
                      <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
              ) : (
                  <div className="h-48 w-full bg-muted/30 flex items-center justify-center border-b border-border">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                  </div>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {blog.author}</span>
                </div>

                <h2 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                  {blog.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border border-dashed">
                    {blog.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase font-semibold px-2 py-1 rounded-sm bg-background border border-border text-muted-foreground">
                            {tag}
                        </span>
                    ))}
                    <span className="ml-auto mt-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold">
                        Read More <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {blogs.length === 0 && (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed border-border text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-4 opacity-50 text-primary" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Articles Found</h3>
              <p className="text-sm">There are currently no published blog posts. Check back soon!</p>
          </div>
      )}
    </div>
  );
}
