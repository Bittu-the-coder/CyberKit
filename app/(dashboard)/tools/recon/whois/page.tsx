'use client';

import { useState } from 'react';
import { Database, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard, InfoRow } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';

interface WhoisResult {
  domain: string;
  registrar?: string;
  registrantOrg?: string;
  registrantCountry?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  nameServers?: string[];
  status?: string[];
  ipAddress?: string;
  raw?: string;
  error?: string;
  duration?: number;
}

export default function WhoisPage() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/recon/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), saveResult: true }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ domain: target, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  function copyRaw() {
    if (result?.raw) {
      navigator.clipboard.writeText(result.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <ToolLayout
      title="WHOIS Lookup"
      description="Query domain registration information, registrar details, and ownership data."
      icon={<Database className="h-5 w-5 text-primary" />}
      category="Reconnaissance"
    >
      {/* Input form */}
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="whois-target" className="sr-only">Domain</Label>
            <Input
              id="whois-target"
              type="text"
              placeholder="example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Querying...
              </span>
            ) : (
              'Lookup'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Enter a domain name (e.g. <code className="font-mono">google.com</code>)
        </p>
      </div>

      {/* Results */}
      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">{result.domain}</h3>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="success">Found</Badge>
                )}
              </div>
              {result.raw && (
                <Button variant="ghost" size="sm" onClick={copyRaw}>
                  {copied ? <CheckCheck className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy raw'}
                </Button>
              )}
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : (
              <div className="p-5 space-y-0">
                <InfoRow label="Domain" value={result.domain} mono />
                <InfoRow label="IP Address" value={result.ipAddress} mono />
                <InfoRow label="Registrar" value={result.registrar} />
                <InfoRow label="Registrant Org" value={result.registrantOrg} />
                <InfoRow label="Country" value={result.registrantCountry} />
                <InfoRow label="Created" value={result.createdDate} />
                <InfoRow label="Updated" value={result.updatedDate} />
                <InfoRow label="Expires" value={result.expiresDate} />
                <InfoRow label="Name Servers" value={result.nameServers} mono />
                <InfoRow label="Status" value={result.status} />
                {result.duration && (
                  <InfoRow label="Response Time" value={`${result.duration}ms`} mono />
                )}
              </div>
            )}

            {/* Raw output */}
            {result.raw && (
              <details className="border-t border-border">
                <summary className="px-5 py-3 text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
                  Raw WHOIS Output
                </summary>
                <div className="terminal">
                  <pre className="terminal-output text-xs max-h-64 overflow-y-auto">{result.raw}</pre>
                </div>
              </details>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
