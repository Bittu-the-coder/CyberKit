import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROADMAPS = [
  {
    id: 'beginner-hacker',
    title: 'Beginner Ethical Hacker',
    description: 'Your starting path into cybersecurity and ethical hacking.',
    totalSteps: 12,
    steps: [
      { title: 'Networking Fundamentals', done: true, locked: false },
      { title: 'Linux Command Line', done: true, locked: false },
      { title: 'Introduction to Cybersecurity', done: false, locked: false },
      { title: 'Web Application Basics', done: false, locked: false },
      { title: 'OWASP Top 10', done: false, locked: true },
      { title: 'Basic Recon Techniques', done: false, locked: true },
    ],
  },
  {
    id: 'pentester',
    title: 'Professional Penetration Tester',
    description: 'Comprehensive path to become a professional pentester.',
    totalSteps: 20,
    steps: [
      { title: 'Advanced Networking', done: false, locked: false },
      { title: 'Python for Security', done: false, locked: false },
      { title: 'Web App Pentesting', done: false, locked: true },
      { title: 'Network Pentesting', done: false, locked: true },
      { title: 'Active Directory Attacks', done: false, locked: true },
      { title: 'Report Writing', done: false, locked: true },
    ],
  },
  {
    id: 'bug-bounty',
    title: 'Bug Bounty Hunter',
    description: 'Focus on web vulnerability hunting and responsible disclosure.',
    totalSteps: 15,
    steps: [
      { title: 'HTTP/S Deep Dive', done: false, locked: false },
      { title: 'Burp Suite Mastery', done: false, locked: false },
      { title: 'XSS & Injection Attacks', done: false, locked: true },
      { title: 'API Security Testing', done: false, locked: true },
      { title: 'Writing Quality Reports', done: false, locked: true },
      { title: 'Responsible Disclosure', done: false, locked: true },
    ],
  },
];

export default function RoadmapsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Learning Roadmaps</h1>
        <p className="text-muted-foreground text-sm">
          Structured learning paths to guide your cybersecurity career.
        </p>
      </div>

      <div className="space-y-6">
        {ROADMAPS.map((roadmap) => {
          const doneCount = roadmap.steps.filter((s) => s.done).length;
          const progress = Math.round((doneCount / roadmap.totalSteps) * 100);

          return (
            <div key={roadmap.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{roadmap.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{roadmap.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-2xl font-bold font-mono">{progress}%</div>
                  <div className="text-xs text-muted-foreground">{doneCount}/{roadmap.totalSteps} steps</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-background rounded-full border border-border mb-6">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {roadmap.steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 rounded-md',
                      step.locked ? 'opacity-50' : ''
                    )}
                  >
                    {step.done ? (
                      <CheckCircle className="h-4 w-4 text-cyber-green flex-shrink-0" />
                    ) : step.locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn('text-sm', step.done ? 'line-through text-muted-foreground' : '')}>
                      {step.title}
                    </span>
                  </div>
                ))}
                {roadmap.totalSteps > roadmap.steps.length && (
                  <p className="text-xs text-muted-foreground px-3 mt-2">
                    +{roadmap.totalSteps - roadmap.steps.length} more steps...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
