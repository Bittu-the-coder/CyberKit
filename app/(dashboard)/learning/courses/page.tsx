import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COURSES = [
  {
    id: 'web-security-fundamentals',
    title: 'Web Security Fundamentals',
    description: 'Learn the core concepts of web application security, OWASP Top 10, and common vulnerabilities.',
    level: 'Beginner',
    duration: '8 hours',
    lessons: 12,
    tags: ['OWASP', 'XSS', 'SQLi', 'CSRF'],
  },
  {
    id: 'network-pentesting',
    title: 'Network Penetration Testing',
    description: 'Master network enumeration, scanning techniques, and exploitation fundamentals.',
    level: 'Intermediate',
    duration: '12 hours',
    lessons: 18,
    tags: ['Nmap', 'Wireshark', 'Metasploit'],
  },
  {
    id: 'cryptography-essentials',
    title: 'Cryptography Essentials',
    description: 'Understand encryption algorithms, hashing, PKI, and common cryptographic attacks.',
    level: 'Intermediate',
    duration: '6 hours',
    lessons: 10,
    tags: ['AES', 'RSA', 'TLS', 'Hashing'],
  },
  {
    id: 'osint-techniques',
    title: 'OSINT Techniques',
    description: 'Advanced open-source intelligence gathering techniques for security professionals.',
    level: 'Beginner',
    duration: '5 hours',
    lessons: 8,
    tags: ['OSINT', 'Recon', 'Social Engineering'],
  },
  {
    id: 'malware-analysis',
    title: 'Malware Analysis',
    description: 'Static and dynamic malware analysis techniques using industry-standard tools.',
    level: 'Advanced',
    duration: '15 hours',
    lessons: 22,
    tags: ['Reverse Engineering', 'Sandbox', 'IDA'],
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security Fundamentals',
    description: 'Security best practices for AWS, Azure, and GCP environments.',
    level: 'Intermediate',
    duration: '10 hours',
    lessons: 15,
    tags: ['AWS', 'Azure', 'IAM', 'Misconfigs'],
  },
];

const levelColors: Record<string, string> = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/30',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Courses</h1>
        <p className="text-muted-foreground text-sm">
          Structured cybersecurity courses for all skill levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map((course) => (
          <div
            key={course.id}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${levelColors[course.level]}`}>
                {course.level}
              </span>
            </div>

            <h3 className="font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{course.description}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration}
              </span>
              <span>{course.lessons} lessons</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border hover:bg-accent hover:border-primary/40 transition-colors text-sm font-medium">
              Start Course <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
