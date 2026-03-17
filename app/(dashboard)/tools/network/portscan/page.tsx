'use client';

import { useState } from 'react';
import { Wifi, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PortResult {
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service?: string;
}

interface PortScanResult {
  target: string;
  ports: PortResult[];
  openCount: number;
  duration?: number;
  error?: string;
  note?: string;
}

export default function PortScanPage() {
  const [target, setTarget] = useState('');
  const [ports, setPorts] = useState('22,80,443,8080,8443,3000,3306,5432,6379,27017');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortScanResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/network/portscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), ports }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ target, ports: [], openCount: 0, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Port Scanner"
      description="Scan TCP ports to discover open services on a target host."
      icon={<Wifi className="h-5 w-5 text-primary" />}
      category="Network"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-4 p-3 bg-background border border-border rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-cyber-yellow mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="text-cyber-yellow font-semibold">Legal Warning:</span> Only scan systems you own or have explicit written permission to scan. Port scanning without authorization may be illegal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="scan-target">Target (IP or Domain)</Label>
            <Input
              id="scan-target"
              type="text"
              placeholder="192.168.1.1 or example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scan-ports">Ports</Label>
            <Input
              id="scan-ports"
              type="text"
              placeholder="22,80,443 or 1-1024"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated ports (22,80,443) or range (1-1024). Max 100 ports.
            </p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Scanning...
              </span>
            ) : (
              'Start Scan'
            )}
          </Button>
        </form>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">{result.target}</h3>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant={result.openCount > 0 ? 'success' : 'secondary'}>
                    {result.openCount} open port{result.openCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {result.duration && (
                <span className="text-xs text-muted-foreground font-mono">{result.duration}ms</span>
              )}
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : (
              <div className="p-5">
                {result.note && (
                  <div className="mb-4 flex items-start gap-2 p-3 bg-background border border-border rounded-md">
                    <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{result.note}</p>
                  </div>
                )}
                {result.ports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No results.</p>
                ) : (
                  <div className="space-y-1">
                    {result.ports.filter(p => p.state === 'open').map((port) => (
                      <div key={port.port} className="flex items-center gap-4 py-2 px-3 bg-background rounded border border-border">
                        <span className="status-dot status-dot-online" />
                        <span className="font-mono text-sm w-16 flex-shrink-0 text-cyber-green">{port.port}/tcp</span>
                        <Badge variant="success" className="text-xs">open</Badge>
                        {port.service && (
                          <span className="text-sm text-muted-foreground">{port.service}</span>
                        )}
                      </div>
                    ))}
                    {result.ports.filter(p => p.state === 'closed').length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {result.ports.filter(p => p.state === 'closed').length} ports closed
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
