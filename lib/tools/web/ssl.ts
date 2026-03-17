import * as tls from 'tls';
import * as https from 'https';

export interface SSLResult {
  hostname: string;
  valid: boolean;
  subject?: {
    CN?: string;
    O?: string;
    C?: string;
  };
  issuer?: {
    O?: string;
    CN?: string;
  };
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  fingerprint?: string;
  protocol?: string;
  cipher?: string;
  subjectAltNames?: string[];
  selfSigned?: boolean;
  expired?: boolean;
  error?: string;
}

export async function runSSLCheck(hostname: string): Promise<SSLResult> {
  const cleanHost = hostname.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  return new Promise((resolve) => {
    const options = {
      host: cleanHost,
      port: 443,
      servername: cleanHost,
      rejectUnauthorized: false,
      timeout: 15000,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate(true);
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol() ?? undefined;

      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        return resolve({ hostname: cleanHost, valid: false, error: 'No certificate returned' });
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const expired = daysRemaining < 0;
      const selfSigned = cert.issuer?.CN === cert.subject?.CN;

      const sans: string[] = [];
      if (cert.subjectaltname) {
        cert.subjectaltname.split(',').forEach((san) => {
          const trimmed = san.trim().replace(/^DNS:/, '');
          if (trimmed) sans.push(trimmed);
        });
      }

      socket.destroy();
      resolve({
        hostname: cleanHost,
        valid: !expired && socket.authorized,
        subject: {
          CN: Array.isArray(cert.subject?.CN) ? (cert.subject.CN as string[])[0] : (cert.subject?.CN as string | undefined),
          O: Array.isArray(cert.subject?.O) ? (cert.subject.O as string[])[0] : (cert.subject?.O as string | undefined),
          C: Array.isArray(cert.subject?.C) ? (cert.subject.C as string[])[0] : (cert.subject?.C as string | undefined),
        },
        issuer: {
          O: Array.isArray(cert.issuer?.O) ? (cert.issuer.O as string[])[0] : (cert.issuer?.O as string | undefined),
          CN: Array.isArray(cert.issuer?.CN) ? (cert.issuer.CN as string[])[0] : (cert.issuer?.CN as string | undefined),
        },
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        daysRemaining,
        fingerprint: cert.fingerprint256,
        protocol,
        cipher: cipher?.name,
        subjectAltNames: sans,
        selfSigned,
        expired,
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ hostname: cleanHost, valid: false, error: err.message });
    });

    socket.setTimeout(15000, () => {
      socket.destroy();
      resolve({ hostname: cleanHost, valid: false, error: 'Connection timed out' });
    });
  });
}
