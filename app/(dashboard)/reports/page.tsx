'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Trash2, Download, Database, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

interface ScanResult {
  _id: string;
  toolName: string;
  target: string;
  status: string;
  severity: string;
  duration?: number;
  createdAt: string;
}

interface ReportsData {
  results: ScanResult[];
  total: number;
  page: number;
  limit: number;
}

const severityColors: Record<string, string> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
  info: 'outline',
};

const toolLabels: Record<string, string> = {
  whois: 'WHOIS',
  'dns-enum': 'DNS Enumeration',
  'http-headers': 'HTTP Headers',
  'ssl-inspector': 'SSL Inspector',
  'port-scan': 'Port Scan',
  'username-search': 'Username Search',
};

export default function ReportsPage() {
  const [toolFilter, setToolFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery<ReportsData>({
    queryKey: ['reports', toolFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (toolFilter) params.set('tool', toolFilter);
      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    },
  });

  async function deleteReport(id: string) {
    await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Scan History</h1>
          <p className="text-muted-foreground text-sm">
            All your saved scan results in one place.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={toolFilter}
          onChange={(e) => { setToolFilter(e.target.value); setPage(1); }}
          className="w-48"
        >
          <option value="">All Tools</option>
          {Object.entries(toolLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">
            Failed to load scan history. Please sign in to view your results.
          </div>
        ) : !data?.results.length ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No scan results yet</h3>
            <p className="text-sm text-muted-foreground">
              Run any security tool to save results here automatically.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tool</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.results.map((result) => (
                  <tr key={result._id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-background border border-border rounded px-2 py-0.5">
                        {toolLabels[result.toolName] ?? result.toolName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs truncate max-w-[200px] block">{result.target}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={result.status === 'completed' ? 'success' : result.status === 'failed' ? 'destructive' : 'secondary'}>
                        {result.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(severityColors[result.severity] as 'destructive' | 'warning' | 'secondary' | 'outline') ?? 'outline'}>
                        {result.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(result.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteReport(result._id)}
                        className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.total > data.limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)} of {data.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * data.limit >= data.total}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
