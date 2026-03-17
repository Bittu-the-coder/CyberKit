import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Terminal } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, icon, category, children }: ToolLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Tool header */}
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {category}
            </span>
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

interface ResultCardProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  children?: React.ReactNode;
  className?: string;
}

export function ResultCard({ status, children, className }: ResultCardProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {status === 'loading' && (
        <div className="p-8 flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Running scan...</p>
        </div>
      )}
      {(status === 'success' || status === 'error') && children}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | string[] | null;
  mono?: boolean;
}

export function InfoRow({ label, value, mono }: InfoRowProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div className="flex gap-4 py-2 border-b border-border last:border-0">
      <span className="w-40 flex-shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm flex-1 break-all', mono && 'font-mono text-cyber-green')}>
        {Array.isArray(value) ? (
          <ul className="space-y-0.5">
            {value.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'completed' | 'running' | 'pending' | 'failed' | 'unknown';
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = {
    completed: { icon: <CheckCircle className="h-4 w-4 text-cyber-green" />, text: 'Completed', color: 'text-cyber-green' },
    running: { icon: <Clock className="h-4 w-4 text-cyber-yellow animate-pulse" />, text: 'Running', color: 'text-cyber-yellow' },
    pending: { icon: <Clock className="h-4 w-4 text-muted-foreground" />, text: 'Pending', color: 'text-muted-foreground' },
    failed: { icon: <AlertCircle className="h-4 w-4 text-destructive" />, text: 'Failed', color: 'text-destructive' },
    unknown: { icon: <Terminal className="h-4 w-4 text-muted-foreground" />, text: 'Unknown', color: 'text-muted-foreground' },
  };

  const cfg = config[status] ?? config.unknown;

  return (
    <div className={cn('flex items-center gap-1.5 text-sm', cfg.color)}>
      {cfg.icon}
      <span>{label ?? cfg.text}</span>
    </div>
  );
}
