'use client';

import { useState } from 'react';
import { Bug, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import { cn, getSeverityBadgeClass } from '@/lib/utils';

interface CVE {
  id: string;
  description: string;
  published?: string;
  lastModified?: string;
  score: number | null;
  severity: string | null;
  references: string[];
}

interface CVEResult {
  query: string;
  total: number;
  results: CVE[];
  error?: string;
}

function SeverityBadge({ severity }: { severity: string | null }) {
  if (!severity) return null;
  const s = severity.toLowerCase();
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', getSeverityBadgeClass(s))}>
      {severity}
    </span>
  );
}

export default function CVEPage() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CVEResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    const params = new URLSearchParams({ q: query.trim(), limit: '20' });
    if (severity) params.set('severity', severity);

    try {
      const res = await fetch(`/api/tools/cve?${params}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ query, total: 0, results: [], error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  function formatScore(score: number | null): string {
    if (score === null) return 'N/A';
    return score.toFixed(1);
  }

  function getScoreColor(score: number | null): string {
    if (!score) return 'text-muted-foreground';
    if (score >= 9) return 'text-red-400';
    if (score >= 7) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-blue-400';
  }

  return (
    <ToolLayout
      title="CVE Research"
      description="Search the NVD (National Vulnerability Database) for CVE entries and vulnerability details."
      icon={<Bug className="h-5 w-5 text-primary" />}
      category="Vulnerability Research"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="cve-query" className="sr-only">Search</Label>
              <Input
                id="cve-query"
                type="text"
                placeholder="CVE-2021-44228 or 'log4j' or 'remote code execution'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-36"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <><Search className="h-3.5 w-3.5 mr-1.5" />Search</>
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Data sourced from NVD. Optionally set NVD_API_KEY for higher rate limits.
        </p>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Results for &quot;{result.query}&quot;</h3>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  <Badge variant="secondary">{result.total.toLocaleString()} total</Badge>
                )}
              </div>
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : result.results.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No CVEs found for this query.</div>
            ) : (
              <div className="divide-y divide-border">
                {result.results.map((cve) => (
                  <div key={cve.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          {cve.id} <ExternalLink className="h-3 w-3" />
                        </a>
                        <SeverityBadge severity={cve.severity} />
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={cn('text-lg font-bold font-mono', getScoreColor(cve.score))}>
                          {formatScore(cve.score)}
                        </span>
                        <div className="text-xs text-muted-foreground">CVSS</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {cve.description.slice(0, 300)}
                      {cve.description.length > 300 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {cve.published && (
                        <span>Published: {new Date(cve.published).toLocaleDateString()}</span>
                      )}
                      {cve.references.length > 0 && (
                        <a
                          href={cve.references[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Reference <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
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
