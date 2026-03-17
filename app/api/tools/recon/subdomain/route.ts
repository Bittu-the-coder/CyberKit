import { NextRequest, NextResponse } from 'next/server';
import { subdomainEnumSchema } from '@/lib/validators/tools';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'webmail', 'admin', 'portal',
  'api', 'dev', 'staging', 'test', 'beta', 'cdn', 'static', 'assets', 'img',
  'blog', 'shop', 'store', 'app', 'mobile', 'secure', 'vpn', 'ssh', 'git',
  'jenkins', 'ci', 'ns1', 'ns2', 'mx', 'mail2', 'remote', 'intranet', 'wiki',
  'forum', 'support', 'help', 'docs', 'status', 'monitor', 'metrics', 'grafana',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subdomainEnumSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { domain } = parsed.data;

    const results = await Promise.allSettled(
      COMMON_SUBDOMAINS.map(async (prefix) => {
        const subdomain = `${prefix}.${domain}`;
        try {
          const ips = await resolve4(subdomain);
          return { subdomain, ip: ips[0], found: true };
        } catch {
          return { subdomain, found: false };
        }
      })
    );

    const subdomains = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { subdomain: '', found: false }
    );

    return NextResponse.json({ domain, subdomains });
  } catch (err) {
    console.error('Subdomain enum error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
