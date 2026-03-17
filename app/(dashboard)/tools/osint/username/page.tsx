'use client';

import { useState } from 'react';
import { User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout, ResultCard } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';

interface PlatformResult {
  platform: string;
  url: string;
  found: boolean | null;
  error?: string;
}

interface UsernameResult {
  username: string;
  results: PlatformResult[];
}

export default function UsernameSearchPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UsernameResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tools/osint/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ username, results: [] });
    } finally {
      setLoading(false);
    }
  }

  const found = result?.results.filter((r) => r.found === true) ?? [];
  const notFound = result?.results.filter((r) => r.found === false) ?? [];
  const unknown = result?.results.filter((r) => r.found === null) ?? [];

  return (
    <ToolLayout
      title="Username Search"
      description="Search for a username across multiple social media and tech platforms."
      icon={<User className="h-5 w-5 text-primary" />}
      category="OSINT"
    >
      <div className="bg-card border border-border rounded-lg p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="username-input" className="sr-only">Username</Label>
            <Input
              id="username-input"
              type="text"
              placeholder="hackerman"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Searches across GitHub, Reddit, Dev.to, HackerNews, GitLab, Keybase, and more.
        </p>
      </div>

      <ResultCard status={loading ? 'loading' : result ? 'success' : 'idle'}>
        {result && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold font-mono">@{result.username}</h3>
                <Badge variant="success">{found.length} found</Badge>
                {unknown.length > 0 && (
                  <Badge variant="secondary">{unknown.length} unknown</Badge>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {found.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-cyber-green uppercase mb-2">Found ({found.length})</h4>
                  <div className="space-y-1">
                    {found.map((r) => (
                      <div key={r.platform} className="flex items-center justify-between py-2 px-3 bg-background rounded border border-border">
                        <div className="flex items-center gap-2">
                          <span className="status-dot status-dot-online" />
                          <span className="text-sm font-medium">{r.platform}</span>
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View Profile <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notFound.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Not Found ({notFound.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {notFound.map((r) => (
                      <span key={r.platform} className="text-xs px-2 py-1 rounded bg-background border border-border text-muted-foreground">
                        {r.platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {unknown.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Unknown ({unknown.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {unknown.map((r) => (
                      <a
                        key={r.platform}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex items-center gap-1"
                      >
                        {r.platform} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ResultCard>
    </ToolLayout>
  );
}
