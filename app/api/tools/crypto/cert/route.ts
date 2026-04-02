import { NextRequest, NextResponse } from 'next/server';
import selfsigned from 'selfsigned';
import { createHash, X509Certificate } from 'crypto';

interface CertBody {
  commonName?: string;
  organization?: string;
  country?: string;
  days?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CertBody;

    const commonName = (body.commonName ?? 'localhost').trim() || 'localhost';
    const organization = (body.organization ?? 'CyberKit').trim() || 'CyberKit';
    const country = (body.country ?? 'US').trim().slice(0, 2).toUpperCase() || 'US';
    const days = Math.min(Math.max(Number(body.days ?? 365), 1), 3650);

    const attrs = [
      { name: 'commonName', value: commonName },
      { name: 'organizationName', value: organization },
      { name: 'countryName', value: country },
    ];

    const cert = await selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days,
      keySize: 2048,
      extensions: [
        {
          name: 'basicConstraints',
          cA: true,
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
        {
          name: 'subjectAltName',
          altNames: [{ type: 2, value: commonName }],
        },
      ],
    } as any);

    const x509 = new X509Certificate(cert.cert);
    const fingerprintSha256 = createHash('sha256').update(x509.raw).digest('hex').match(/.{1,2}/g)?.join(':') ?? '';

    return NextResponse.json({
      privateKeyPem: cert.private,
      certificatePem: cert.cert,
      fingerprintSha256,
      validFrom: x509.validFrom,
      validTo: x509.validTo,
      subject: x509.subject,
      issuer: x509.issuer,
      serialNumber: x509.serialNumber,
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Failed to generate self-signed certificate' }, { status: 500 });
  }
}
