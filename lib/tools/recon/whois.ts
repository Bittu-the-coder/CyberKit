import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';

const execAsync = promisify(exec);
const dnsResolve = promisify(dns.resolve);
const dnsLookup = promisify(dns.lookup);

export interface WhoisResult {
  domain: string;
  registrar?: string;
  registrantOrg?: string;
  registrantCountry?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  nameServers?: string[];
  status?: string[];
  raw?: string;
  ipAddress?: string;
  error?: string;
}

function parseWhoisData(raw: string): Partial<WhoisResult> {
  const extract = (patterns: RegExp[]): string | undefined => {
    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return undefined;
  };

  const extractAll = (patterns: RegExp[]): string[] => {
    const results: string[] = [];
    for (const pattern of patterns) {
      const matches = raw.matchAll(new RegExp(pattern.source, 'gi'));
      for (const match of matches) {
        if (match[1]) results.push(match[1].trim());
      }
    }
    return [...new Set(results)];
  };

  return {
    registrar: extract([/Registrar:\s*(.+)/i, /Sponsoring Registrar:\s*(.+)/i]),
    registrantOrg: extract([/Registrant Organization:\s*(.+)/i, /org:\s*(.+)/i]),
    registrantCountry: extract([/Registrant Country:\s*(.+)/i, /country:\s*(.+)/i]),
    createdDate: extract([/Creation Date:\s*(.+)/i, /Created Date:\s*(.+)/i, /created:\s*(.+)/i]),
    updatedDate: extract([/Updated Date:\s*(.+)/i, /Last Modified:\s*(.+)/i]),
    expiresDate: extract([/Registry Expiry Date:\s*(.+)/i, /Expiration Date:\s*(.+)/i, /expires:\s*(.+)/i]),
    nameServers: extractAll([/Name Server:\s*(.+)/i]),
    status: extractAll([/Domain Status:\s*(.+)/i, /Status:\s*(.+)/i]),
  };
}

export async function runWhois(target: string): Promise<WhoisResult> {
  const startTime = Date.now();

  try {
    let ipAddress: string | undefined;
    try {
      const lookup = await dnsLookup(target);
      ipAddress = lookup.address;
    } catch {
      // IP resolution is best-effort
    }

    try {
      const { stdout } = await execAsync(`whois ${target}`, { timeout: 15000 });
      const parsed = parseWhoisData(stdout);

      return {
        domain: target,
        ...parsed,
        ipAddress,
        raw: stdout.slice(0, 5000),
      };
    } catch {
      // Fallback: return basic info with DNS
      return {
        domain: target,
        ipAddress,
        error: 'WHOIS lookup failed — whois binary may not be installed',
        raw: '',
      };
    }
  } catch (err) {
    return {
      domain: target,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
