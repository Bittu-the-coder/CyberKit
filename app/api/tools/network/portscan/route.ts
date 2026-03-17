import { NextRequest, NextResponse } from 'next/server';
import { portScanSchema } from '@/lib/validators/tools';
import * as net from 'net';

const COMMON_SERVICES: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  445: 'SMB',
  993: 'IMAPS',
  995: 'POP3S',
  1433: 'MSSQL',
  3000: 'Dev Server',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  5900: 'VNC',
  6379: 'Redis',
  8080: 'HTTP Alt',
  8443: 'HTTPS Alt',
  27017: 'MongoDB',
};

function parsePorts(portsStr: string): number[] {
  const ports: number[] = [];
  const parts = portsStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = start; p <= Math.min(end, start + 99); p++) {
          ports.push(p);
        }
      }
    } else {
      const port = parseInt(trimmed);
      if (!isNaN(port) && port > 0 && port <= 65535) {
        ports.push(port);
      }
    }
  }

  return [...new Set(ports)].slice(0, 100);
}

function checkPort(host: string, port: number, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (open: boolean) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(open);
      }
    };

    socket.setTimeout(timeout);
    socket.connect(port, host, () => done(true));
    socket.on('error', () => done(false));
    socket.on('timeout', () => done(false));
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = portScanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { target, ports: portsStr } = parsed.data;
    const portsToScan = parsePorts(portsStr);

    if (portsToScan.length === 0) {
      return NextResponse.json({ error: 'No valid ports specified' }, { status: 400 });
    }

    const startTime = Date.now();

    // Scan ports with limited concurrency
    const CONCURRENCY = 20;
    const results: Array<{ port: number; state: 'open' | 'closed'; service?: string }> = [];

    for (let i = 0; i < portsToScan.length; i += CONCURRENCY) {
      const batch = portsToScan.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (port) => {
          const open = await checkPort(target, port);
          return {
            port,
            state: open ? 'open' as const : 'closed' as const,
            service: open ? COMMON_SERVICES[port] : undefined,
          };
        })
      );
      results.push(...batchResults);
    }

    const openPorts = results.filter((r) => r.state === 'open');
    const duration = Date.now() - startTime;

    return NextResponse.json({
      target,
      ports: results,
      openCount: openPorts.length,
      duration,
    });
  } catch (err) {
    console.error('Port scan error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
