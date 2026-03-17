'use client';

import { useState } from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import dns from 'dns';

interface SubdomainResult {
  domain: string;
  subdomains: Array<{ subdomain: string; ip?: string; found: boolean }>;
  error?: string;
}

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'webmail', 'admin', 'portal',
  'api', 'dev', 'staging', 'test', 'beta', 'cdn', 'static', 'assets', 'img',
  'blog', 'shop', 'store', 'app', 'mobile', 'secure', 'vpn', 'ssh', 'git',
  'jenkins', 'ci', 'ns1', 'ns2', 'mx', 'mail2', 'remote', 'intranet', 'wiki',
  'forum', 'support', 'help', 'docs', 'status', 'monitor', 'metrics', 'grafana',
];

export default function SubdomainPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubdomainResult | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const res = await fetch('/api/tools/recon/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ domain, subdomains: [], error: 'Network error' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  const found = result?.subdomains.filter((s) => s.found) ?? [];

  return (
    <ToolLayout
      title="Subdomain Enumeration"
      description="Enumerate subdomains using wordlist-based DNS resolution."
      icon={<Globe className="h-5 w-5 text-primary" />}
      category="Reconnaissance"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-4 p-3 bg-background border border-border rounded-md">
          <p className="text-xs text-muted-foreground">
            <span className="text-cyber-yellow font-semibold">⚠ Legal Notice:</span> Only scan domains you own or have explicit written permission to test. Unauthorized scanning may violate computer crime laws.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="sub-domain" className="sr-only">Domain</Label>
            <Input
              id="sub-domain"
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Scanning...
              </span>
            ) : (
              'Enumerate'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Checks {COMMON_SUBDOMAINS.length} common subdomain prefixes via DNS resolution.
        </p>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">{result.domain}</h3>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="success">{found.length} found</Badge>
                )}
              </div>
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : found.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No subdomains found with common wordlist.</div>
            ) : (
              <div className="p-5">
                <div className="space-y-1">
                  {found.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-background rounded border border-border">
                      <div className="flex items-center gap-3">
                        <span className="status-dot status-dot-online" />
                        <span className="font-mono text-sm text-cyber-green">{sub.subdomain}</span>
                      </div>
                      {sub.ip && (
                        <span className="font-mono text-xs text-muted-foreground">{sub.ip}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
