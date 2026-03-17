'use client';

import { useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SecurityHeaderAnalysis {
  name: string;
  present: boolean;
  value?: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;
}

interface HeadersResult {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  securityHeaders: SecurityHeaderAnalysis[];
  server?: string;
  technologies: string[];
  responseTime: number;
  error?: string;
}

const severityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: <XCircle className="h-4 w-4 text-red-400" /> },
  medium: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: <AlertTriangle className="h-4 w-4 text-orange-400" /> },
  low: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: <AlertTriangle className="h-4 w-4 text-yellow-400" /> },
  info: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: <CheckCircle className="h-4 w-4 text-green-400" /> },
};

export default function HttpHeadersPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeadersResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/web/headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ url, statusCode: 0, statusText: '', headers: {}, securityHeaders: [], technologies: [], responseTime: 0, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  const missingCritical = result?.securityHeaders.filter((h) => !h.present && (h.severity === 'high' || h.severity === 'medium')) ?? [];
  const score = result ? Math.round(
    (result.securityHeaders.filter((h) => h.present).length / result.securityHeaders.length) * 100
  ) : 0;

  return (
    <ToolLayout
      title="HTTP Headers Analyzer"
      description="Analyze HTTP response headers and identify missing security headers."
      icon={<Activity className="h-5 w-5 text-primary" />}
      category="Web Pentesting"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="headers-url" className="sr-only">URL</Label>
            <Input
              id="headers-url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </Button>
        </form>
      </div>

      <ResultCard status={loading ? 'loading' : result ? (result.error ? 'error' : 'success') : 'idle'}>
        {result && (
          <div>
            {/* Summary header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">{result.url}</span>
                    {result.statusCode > 0 && (
                      <Badge variant={result.statusCode < 400 ? 'success' : 'destructive'}>
                        {result.statusCode} {result.statusText}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {result.server && <span>Server: <code className="font-mono">{result.server}</code></span>}
                    <span>Response: {result.responseTime}ms</span>
                  </div>
                  {result.technologies.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {result.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                {!result.error && (
                  <div className="text-center flex-shrink-0">
                    <div className={cn(
                      'text-3xl font-bold font-mono',
                      score >= 80 ? 'text-cyber-green' : score >= 50 ? 'text-cyber-yellow' : 'text-destructive'
                    )}>
                      {score}
                    </div>
                    <div className="text-xs text-muted-foreground">Security Score</div>
                  </div>
                )}
              </div>
            </div>

            {result.error ? (
              <div className="p-5 text-sm text-destructive">{result.error}</div>
            ) : (
              <>
                {/* Security headers analysis */}
                <div className="p-5">
                  <h4 className="text-sm font-semibold mb-3">Security Headers Analysis</h4>
                  <div className="space-y-2">
                    {result.securityHeaders.map((header) => {
                      const cfg = severityConfig[header.present ? 'info' : header.severity];
                      return (
                        <div key={header.name} className={cn('rounded-md border p-3', cfg.bg)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {cfg.icon}
                              <span className="text-sm font-mono font-medium">{header.name}</span>
                            </div>
                            <Badge variant={header.present ? 'success' : 'destructive'} className="text-xs flex-shrink-0">
                              {header.present ? 'Present' : 'Missing'}
                            </Badge>
                          </div>
                          {header.value && (
                            <p className="text-xs font-mono text-muted-foreground mt-1 ml-6 break-all">{header.value}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 ml-6">{header.description}</p>
                          {header.recommendation && (
                            <p className="text-xs text-cyber-yellow mt-1 ml-6">💡 {header.recommendation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All response headers */}
                <details className="border-t border-border">
                  <summary className="px-5 py-3 text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
                    All Response Headers ({Object.keys(result.headers).length})
                  </summary>
                  <div className="p-5 space-y-1">
                    {Object.entries(result.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-4 py-1.5 border-b border-border last:border-0">
                        <span className="w-56 flex-shrink-0 text-xs font-mono text-muted-foreground">{key}</span>
                        <span className="text-xs font-mono break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
