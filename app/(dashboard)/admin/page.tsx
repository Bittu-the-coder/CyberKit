import { dbConnect } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { Course } from '@/lib/db/models/Course';
import { ScanResult } from '@/lib/db/models/ScanResult';
import { User } from '@/lib/db/models/User';
import { Activity, BookOpen, FileText, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
  await dbConnect();

  const [userCount, courseCount, blogCount, scanCount] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Blog.countDocuments(),
    ScanResult.countDocuments()
  ]);

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-blue-400' },
    { label: 'Scans Run', value: scanCount, icon: Activity, color: 'text-green-400' },
    { label: 'Courses', value: courseCount, icon: BookOpen, color: 'text-yellow-400' },
    { label: 'Blogs', value: blogCount, icon: FileText, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">System overview and platform statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-background border border-border rounded-lg p-5 flex items-center gap-4">
            <div className={`p-3 rounded-md bg-accent/50 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 border border-primary/20 bg-primary/5 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          System Status
        </h2>
        <p className="text-sm text-muted-foreground mb-4">All systems operational. Network scan queues are healthy.</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-green"></span>
          </span>
          <span className="text-cyber-green font-mono">ONLINE</span>
        </div>
      </div>
    </div>
  );
}
