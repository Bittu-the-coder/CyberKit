import { NextRequest, NextResponse } from 'next/server';
import { cveSearchSchema } from '@/lib/validators/tools';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const severity = searchParams.get('severity') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const parsed = cveSearchSchema.safeParse({ query, severity, limit });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      keywordSearch: parsed.data.query,
      resultsPerPage: String(parsed.data.limit),
    });

    if (parsed.data.severity) {
      params.set('cvssV3Severity', parsed.data.severity);
    }

    const nvdKey = process.env.NVD_API_KEY;
    const headers: Record<string, string> = { 'User-Agent': 'CyberKit/1.0' };
    if (nvdKey) headers['apiKey'] = nvdKey;

    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`,
      { headers, signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `NVD API returned ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const cves = (data.vulnerabilities ?? []).map((v: {
      cve: {
        id: string;
        descriptions?: Array<{ lang: string; value: string }>;
        published?: string;
        lastModified?: string;
        metrics?: {
          cvssMetricV31?: Array<{ cvssData: { baseScore: number; baseSeverity: string } }>;
          cvssMetricV30?: Array<{ cvssData: { baseScore: number; baseSeverity: string } }>;
          cvssMetricV2?: Array<{ cvssData: { baseScore: number }; baseSeverity: string }>;
        };
        references?: Array<{ url: string }>;
      };
    }) => {
      const cve = v.cve;
      const description = cve.descriptions?.find((d) => d.lang === 'en')?.value ?? '';
      const cvssV3 = cve.metrics?.cvssMetricV31?.[0] ?? cve.metrics?.cvssMetricV30?.[0];
      const cvssV2 = cve.metrics?.cvssMetricV2?.[0];
      const score = cvssV3?.cvssData?.baseScore ?? cvssV2?.cvssData?.baseScore ?? null;
      const severity = cvssV3?.cvssData?.baseSeverity ?? cvssV2?.baseSeverity ?? null;

      return {
        id: cve.id,
        description,
        published: cve.published,
        lastModified: cve.lastModified,
        score,
        severity,
        references: (cve.references ?? []).slice(0, 5).map((r) => r.url),
      };
    });

    return NextResponse.json({
      query: parsed.data.query,
      total: data.totalResults,
      results: cves,
    });
  } catch (err) {
    console.error('CVE search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
