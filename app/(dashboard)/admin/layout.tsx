import { auth } from '@/lib/auth';
import { Activity, BookOpen, FileText, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: Activity },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Blogs', href: '/admin/blogs', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-card border border-border rounded-lg p-4 sticky top-6">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Admin Panel</h2>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 bg-card/50 border border-border rounded-lg p-6">
        {children}
      </main>
    </div>
  );
}
