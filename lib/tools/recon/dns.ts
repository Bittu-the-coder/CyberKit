import dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveNs = promisify(dns.resolveNs);
const resolveCname = promisify(dns.resolveCname);
const resolveSoa = promisify(dns.resolveSoa);

export interface DnsRecord {
  type: string;
  value: string | string[];
  priority?: number;
}

export interface DnsResult {
  domain: string;
  records: DnsRecord[];
  error?: string;
}

async function safeResolve<T>(
  fn: () => Promise<T>,
  type: string,
  mapper: (data: T) => DnsRecord[]
): Promise<DnsRecord[]> {
  try {
    const data = await fn();
    return mapper(data);
  } catch {
    return [];
  }
}

export async function runDnsEnum(domain: string): Promise<DnsResult> {
  const records: DnsRecord[] = [];

  const [a, aaaa, mx, txt, ns, cname, soa] = await Promise.all([
    safeResolve(
      () => resolve4(domain),
      'A',
      (data: string[]) => data.map((v) => ({ type: 'A', value: v }))
    ),
    safeResolve(
      () => resolve6(domain),
      'AAAA',
      (data: string[]) => data.map((v) => ({ type: 'AAAA', value: v }))
    ),
    safeResolve(
      () => resolveMx(domain),
      'MX',
      (data: dns.MxRecord[]) =>
        data.map((r) => ({ type: 'MX', value: r.exchange, priority: r.priority }))
    ),
    safeResolve(
      () => resolveTxt(domain),
      'TXT',
      (data: string[][]) => data.map((r) => ({ type: 'TXT', value: r.join(' ') }))
    ),
    safeResolve(
      () => resolveNs(domain),
      'NS',
      (data: string[]) => data.map((v) => ({ type: 'NS', value: v }))
    ),
    safeResolve(
      () => resolveCname(domain),
      'CNAME',
      (data: string[]) => data.map((v) => ({ type: 'CNAME', value: v }))
    ),
    safeResolve(
      () => resolveSoa(domain),
      'SOA',
      (data: dns.SoaRecord) => [
        {
          type: 'SOA',
          value: `${data.nsname} ${data.hostmaster} ${data.serial}`,
        },
      ]
    ),
  ]);

  records.push(...a, ...aaaa, ...mx, ...txt, ...ns, ...cname, ...soa);

  if (records.length === 0) {
    return { domain, records: [], error: 'No DNS records found for this domain' };
  }

  return { domain, records };
}
