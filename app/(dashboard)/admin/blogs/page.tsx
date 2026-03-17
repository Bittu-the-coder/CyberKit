'use client';

import { useToast } from '@/hooks/use-toast';
import { IBlog } from '@/lib/db/models/Blog';
import { CheckCircle, Edit, FileText, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not load blogs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs?blogId=${blogId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setBlogs(blogs.filter((b: any) => b._id !== blogId));
      toast({ title: 'Success', description: 'Blog deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete blog.', variant: 'destructive' });
    }
  };

  const togglePublish = async (blog: any) => {
      try {
        const res = await fetch('/api/admin/blogs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blogId: blog._id, published: !blog.published }),
        });
        if (!res.ok) throw new Error('Update failed');

        const updated = await res.json();
        setBlogs(blogs.map((b: any) => b._id === blog._id ? updated : b));
        toast({ title: 'Success', description: 'Publish status updated.' });
      } catch (err) {
          toast({ title: 'Error', description: 'Could not update status.', variant: 'destructive' });
      }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading blogs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Management</h1>
          <p className="text-muted-foreground text-sm">Write and manage platform announcements and articles.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Write Post
        </button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-accent/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3">Title / Article</th>
                <th className="px-6 py-3 border-l border-border">Status</th>
                <th className="px-6 py-3 border-l border-border">Date</th>
                <th className="px-6 py-3 border-l border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog: any) => (
                <tr key={blog._id} className="border-b border-border hover:bg-accent/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded bg-accent flex shrink-0 items-center justify-center mt-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground line-clamp-1">{blog.title}</div>
                        <div className="text-muted-foreground text-xs line-clamp-1 mt-1">{blog.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-l border-border">
                    <button
                        onClick={() => togglePublish(blog)}
                        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-colors ${
                            blog.published
                            ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30 hover:bg-cyber-green/20'
                            : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                        }`}
                    >
                        {blog.published ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {blog.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 border-l border-border text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-l border-border text-right space-x-2 whitespace-nowrap">
                    <button
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors inline-block"
                      title="Edit Post"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors inline-block"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground border-dashed">
                    No blogs written yet. Click "Write Post" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
