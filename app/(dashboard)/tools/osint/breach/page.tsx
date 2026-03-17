'use client';

import { useState } from 'react';
import { Shield, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';

interface BreachEntry {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  PwnCount: number;
  DataClasses: string[];
  Description: string;
  IsVerified: boolean;
}

interface BreachResult {
  email: string;
  breaches: BreachEntry[];
  count: number;
  note?: string;
  error?: string;
}

export default function BreachCheckPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/osint/breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ email, breaches: [], count: 0, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="Data Breach Check"
      description="Check if an email address has appeared in known data breaches via HaveIBeenPwned API."
      icon={<Shield className="h-5 w-5 text-primary" />}
      category="OSINT"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="breach-email" className="sr-only">Email</Label>
            <Input
              id="breach-email"
              type="email"
              placeholder="target@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </span>
            ) : (
              'Check Breaches'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Powered by HaveIBeenPwned API. Requires HIBP_API_KEY in environment variables.
        </p>
      </div>

      <ResultCard status={loading ? 'loading' : result ? 'success' : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">{result.email}</h3>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : result.count > 0 ? (
                  <Badge variant="destructive">{result.count} breach{result.count !== 1 ? 'es' : ''}</Badge>
                ) : (
                  <Badge variant="success">No breaches found</Badge>
                )}
              </div>
            </div>

            {result.note && (
              <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-background border border-border rounded-md">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{result.note}</p>
              </div>
            )}

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : result.count === 0 && !result.note ? (
              <div className="p-5 text-sm text-cyber-green flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Good news! This email was not found in any known data breaches.
              </div>
            ) : result.breaches.length > 0 ? (
              <div className="p-5 space-y-3">
                {result.breaches.map((breach) => (
                  <div key={breach.Name} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold">{breach.Title}</h4>
                        <p className="text-xs text-muted-foreground">{breach.Domain} · Breached {breach.BreachDate}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {breach.IsVerified && <Badge variant="destructive" className="text-xs">Verified</Badge>}
                        <Badge variant="secondary" className="text-xs">
                          {breach.PwnCount.toLocaleString()} accounts
                        </Badge>
                      </div>
                    </div>
                    {breach.DataClasses.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {breach.DataClasses.map((dc) => (
                          <span key={dc} className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                            {dc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
