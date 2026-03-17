'use client';

import { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard, InfoRow } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';

interface SSLResult {
  hostname: string;
  valid: boolean;
  subject?: { CN?: string; O?: string; C?: string };
  issuer?: { O?: string; CN?: string };
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  fingerprint?: string;
  protocol?: string;
  cipher?: string;
  subjectAltNames?: string[];
  selfSigned?: boolean;
  expired?: boolean;
  duration?: number;
  error?: string;
}

export default function SSLPage() {
  const [hostname, setHostname] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hostname.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/web/ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: hostname.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ hostname, valid: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  function getDaysColor(days?: number) {
    if (!days) return 'text-muted-foreground';
    if (days < 0) return 'text-destructive';
    if (days < 30) return 'text-orange-400';
    if (days < 90) return 'text-yellow-400';
    return 'text-cyber-green';
  }

  return (
    <ToolLayout
      title="SSL Certificate Inspector"
      description="Inspect SSL/TLS certificates, check expiry, and verify certificate chain details."
      icon={<Lock className="h-5 w-5 text-primary" />}
      category="Web Pentesting"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="ssl-hostname" className="sr-only">Hostname</Label>
            <Input
              id="ssl-hostname"
              type="text"
              placeholder="example.com"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Inspecting...
              </span>
            ) : (
              'Inspect'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Port 443 will be used. No &quot;https://&quot; prefix needed.
        </p>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error && !result.subject ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">{result.hostname}</h3>
                {result.expired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : result.valid ? (
                  <Badge variant="success">Valid</Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
                {result.selfSigned && <Badge variant="warning">Self-Signed</Badge>}
              </div>
              {result.duration && (
                <span className="text-xs text-muted-foreground font-mono">{result.duration}ms</span>
              )}
            </div>

            {result.error && !result.subject ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : (
              <div className="p-5 space-y-0">
                <InfoRow label="Common Name" value={result.subject?.CN} mono />
                <InfoRow label="Organization" value={result.subject?.O} />
                <InfoRow label="Country" value={result.subject?.C} />
                <InfoRow label="Issued By" value={result.issuer?.O || result.issuer?.CN} />
                <InfoRow label="Valid From" value={result.validFrom ? new Date(result.validFrom).toLocaleString() : undefined} />
                <InfoRow label="Valid To" value={result.validTo ? new Date(result.validTo).toLocaleString() : undefined} />
                <div className="flex gap-4 py-2 border-b border-border last:border-0">
                  <span className="w-40 flex-shrink-0 text-sm text-muted-foreground">Days Remaining</span>
                  <span className={`text-sm font-mono font-semibold ${getDaysColor(result.daysRemaining)}`}>
                    {result.daysRemaining !== undefined
                      ? result.daysRemaining < 0
                        ? `Expired ${Math.abs(result.daysRemaining)} days ago`
                        : `${result.daysRemaining} days`
                      : 'N/A'}
                  </span>
                </div>
                <InfoRow label="Protocol" value={result.protocol} mono />
                <InfoRow label="Cipher" value={result.cipher} mono />
                <InfoRow label="Fingerprint (SHA-256)" value={result.fingerprint} mono />
                <InfoRow label="SANs" value={result.subjectAltNames} mono />
              </div>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
