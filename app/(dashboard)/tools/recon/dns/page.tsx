'use client';

import { useState } from 'react';
import { Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DnsRecord {
  type: string;
  value: string | string[];
  priority?: number;
}

interface DnsResult {
  domain: string;
  records: DnsRecord[];
  duration?: number;
  error?: string;
}

const recordTypeColors: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  AAAA: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  MX: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  TXT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  NS: 'bg-green-500/10 text-green-400 border-green-500/30',
  CNAME: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  SOA: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function DnsPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DnsResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/recon/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), saveResult: true }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ domain, records: [], error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  const groupedRecords = result?.records.reduce<Record<string, DnsRecord[]>>((acc, record) => {
    if (!acc[record.type]) acc[record.type] = [];
    acc[record.type].push(record);
    return acc;
  }, {}) ?? {};

  return (
    <ToolLayout
      title="DNS Enumeration"
      description="Enumerate DNS records including A, AAAA, MX, TXT, NS, CNAME, and SOA records."
      icon={<Network className="h-5 w-5 text-primary" />}
      category="Reconnaissance"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="dns-domain" className="sr-only">Domain</Label>
            <Input
              id="dns-domain"
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
                Enumerating...
              </span>
            ) : (
              'Enumerate'
            )}
          </Button>
        </form>
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
                  <Badge variant="success">{result.records.length} records</Badge>
                )}
              </div>
              {result.duration && (
                <span className="text-xs text-muted-foreground font-mono">{result.duration}ms</span>
              )}
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : result.records.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No records found.</div>
            ) : (
              <div className="p-5 space-y-4">
                {Object.entries(groupedRecords).map(([type, records]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          'text-xs font-mono font-bold px-2 py-0.5 rounded border',
                          recordTypeColors[type] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        )}
                      >
                        {type}
                      </span>
                      <span className="text-xs text-muted-foreground">{records.length} record{records.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-1 ml-2">
                      {records.map((record, i) => (
                        <div key={i} className="flex items-start gap-3 py-1.5 px-3 bg-background rounded border border-border">
                          {record.priority !== undefined && (
                            <span className="text-xs text-muted-foreground font-mono w-8 flex-shrink-0">
                              {record.priority}
                            </span>
                          )}
                          <span className="text-sm font-mono break-all">
                            {Array.isArray(record.value) ? record.value.join(' ') : record.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
