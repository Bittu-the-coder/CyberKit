import { Key, Lock, Shield, Code, Terminal, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LABS = [
  {
    id: 'sqli-basics',
    title: 'SQL Injection Basics',
    description: 'Exploit a vulnerable login form using SQL injection techniques.',
    difficulty: 'Easy',
    category: 'Web',
    points: 100,
    estimatedTime: '30 min',
    solved: 1247,
    icon: <Code className="h-4 w-4 text-blue-400" />,
  },
  {
    id: 'xss-hunting',
    title: 'XSS Hunting',
    description: 'Find and exploit reflected and stored Cross-Site Scripting vulnerabilities.',
    difficulty: 'Easy',
    category: 'Web',
    points: 150,
    estimatedTime: '45 min',
    solved: 892,
    icon: <Code className="h-4 w-4 text-blue-400" />,
  },
  {
    id: 'buffer-overflow',
    title: 'Stack Buffer Overflow',
    description: 'Exploit a classic stack buffer overflow vulnerability to gain shell access.',
    difficulty: 'Medium',
    category: 'Binary Exploitation',
    points: 300,
    estimatedTime: '2 hours',
    solved: 423,
    icon: <Terminal className="h-4 w-4 text-orange-400" />,
  },
  {
    id: 'jwt-attacks',
    title: 'JWT Attack Vectors',
    description: 'Exploit common JWT misconfigurations including alg:none and weak secrets.',
    difficulty: 'Medium',
    category: 'Web',
    points: 250,
    estimatedTime: '1 hour',
    solved: 678,
    icon: <Lock className="h-4 w-4 text-purple-400" />,
  },
  {
    id: 'privilege-escalation',
    title: 'Linux Privilege Escalation',
    description: 'Escalate from a low-privileged user to root on a Linux system.',
    difficulty: 'Hard',
    category: 'System',
    points: 500,
    estimatedTime: '3 hours',
    solved: 234,
    icon: <Shield className="h-4 w-4 text-red-400" />,
  },
  {
    id: 'crypto-challenge',
    title: 'Cryptographic Challenges',
    description: 'Break weak encryption implementations and recover plaintext from ciphertext.',
    difficulty: 'Hard',
    category: 'Cryptography',
    points: 400,
    estimatedTime: '2.5 hours',
    solved: 312,
    icon: <Key className="h-4 w-4 text-yellow-400" />,
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500/10 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function LabsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">CTF Labs</h1>
        <p className="text-muted-foreground text-sm">
          Hands-on capture the flag challenges to sharpen your offensive security skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center">
                {lab.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[lab.difficulty]}`}>
                  {lab.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {lab.points} pts
                </span>
              </div>
            </div>

            <h3 className="font-semibold mb-2">{lab.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{lab.description}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lab.estimatedTime}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-background border border-border">{lab.category}</span>
              <span>{lab.solved.toLocaleString()} solved</span>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border hover:bg-accent hover:border-primary/40 transition-colors text-sm font-medium">
              <Terminal className="h-3.5 w-3.5" />
              Launch Lab
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
