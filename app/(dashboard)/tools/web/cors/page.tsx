'use client';

import { useState } from 'react';
import { Wifi, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard, InfoRow } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';

interface CorsResult {
  url: string;
  allowOrigin?: string;
  allowMethods?: string;
  allowHeaders?: string;
  allowCredentials?: string;
  exposeHeaders?: string;
  maxAge?: string;
  wildcardOrigin: boolean;
  credentialsWithWildcard: boolean;
  error?: string;
}

export default function CorsPage() {
  const [url, setUrl] = useState('');
  const [origin, setOrigin] = useState('https://attacker.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorsResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/web/cors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), origin: origin.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ url, wildcardOrigin: false, credentialsWithWildcard: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="CORS Checker"
      description="Check Cross-Origin Resource Sharing (CORS) configuration for misconfiguration vulnerabilities."
      icon={<Wifi className="h-5 w-5 text-primary" />}
      category="Web Pentesting"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cors-url">Target URL</Label>
            <Input
              id="cors-url"
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cors-origin">Test Origin</Label>
            <Input
              id="cors-origin"
              type="text"
              placeholder="https://attacker.com"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">The origin header value to send in the preflight request.</p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </span>
            ) : (
              'Check CORS'
            )}
          </Button>
        </form>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono text-sm">{result.url}</h3>
                {result.credentialsWithWildcard ? (
                  <Badge variant="destructive">Critical Misconfiguration</Badge>
                ) : result.wildcardOrigin ? (
                  <Badge variant="warning">Wildcard Origin</Badge>
                ) : (
                  <Badge variant="success">Configured</Badge>
                )}
              </div>
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : (
              <div className="p-5">
                <div className="space-y-0 mb-4">
                  <InfoRow label="Allow-Origin" value={result.allowOrigin} mono />
                  <InfoRow label="Allow-Methods" value={result.allowMethods} mono />
                  <InfoRow label="Allow-Headers" value={result.allowHeaders} mono />
                  <InfoRow label="Allow-Credentials" value={result.allowCredentials} mono />
                  <InfoRow label="Expose-Headers" value={result.exposeHeaders} mono />
                  <InfoRow label="Max-Age" value={result.maxAge} mono />
                </div>

                {result.credentialsWithWildcard && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1">
                      <XCircle className="h-4 w-4" />
                      Critical: Wildcard origin with credentials
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The server allows credentials (cookies, auth headers) with a wildcard origin. This is a critical misconfiguration that allows any site to make authenticated requests.
                    </p>
                  </div>
                )}
                {result.wildcardOrigin && !result.credentialsWithWildcard && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mb-1">
                      <CheckCircle className="h-4 w-4" />
                      Wildcard origin configured
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The server allows all origins (*). This may be intentional for public APIs but should be reviewed.
                    </p>
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
