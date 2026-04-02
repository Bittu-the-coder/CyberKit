import { Beaker, Clock3, Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PLANNED_LABS = [
  {
    id: 'sqli-basics',
    title: 'SQL Injection Basics',
    description: 'Exploit a vulnerable login flow and learn defensive countermeasures.',
    difficulty: 'Easy',
  },
  {
    id: 'xss-hunting',
    title: 'XSS Hunting',
    description: 'Find reflected and stored XSS vectors in realistic web scenarios.',
    difficulty: 'Easy',
  },
  {
    id: 'jwt-attacks',
    title: 'JWT Attack Vectors',
    description: 'Practice exploitation and hardening for common token implementation flaws.',
    difficulty: 'Medium',
  },
  {
    id: 'buffer-overflow',
    title: 'Stack Buffer Overflow',
    description: 'Walk through classical memory-corruption exploit development steps.',
    difficulty: 'Medium',
  },
  {
    id: 'privilege-escalation',
    title: 'Linux Privilege Escalation',
    description: 'Escalate from low-privileged access to root in a controlled environment.',
    difficulty: 'Hard',
  },
  {
    id: 'crypto-challenge',
    title: 'Cryptographic Challenges',
    description: 'Break weak crypto implementations and recover protected plaintext.',
    difficulty: 'Hard',
  },
];

export default function LabsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">CTF Labs</h1>
        <p className="text-muted-foreground text-sm">
          Hands-on capture-the-flag challenges are currently being wired and will be released soon.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
        <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
          <Construction className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Labs Under Development</h2>
            <Badge variant="warning">Under Development</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            We are finalizing deployment, scoring, and sandbox provisioning. You can preview the planned labs below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANNED_LABS.map((lab) => (
          <div key={lab.id} className="bg-card border border-border rounded-lg p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center">
                <Beaker className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline">{lab.difficulty}</Badge>
            </div>
            <h3 className="font-semibold mb-2">{lab.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{lab.description}</p>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground cursor-not-allowed"
              disabled
            >
              <Clock3 className="h-3.5 w-3.5" />
              Under Development
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
