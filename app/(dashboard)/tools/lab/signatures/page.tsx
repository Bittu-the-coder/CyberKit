'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Shield } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Result({ value }: { value: string }) {
  if (!value) return null;
  const isOk = /valid|match/i.test(value);
  const isBad = /invalid|mismatch/i.test(value);
  return (
    <p className={`text-sm font-medium px-2 py-1 rounded ${isOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isBad ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-muted text-foreground'}`}>
      {value}
    </p>
  );
}

function toPem(b64: string, label: string) {
  const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}
function fromPem(pem: string) {
  return pem.replace(/-----BEGIN[^-]+-----/g, '').replace(/-----END[^-]+-----/g, '').replace(/\s+/g, '');
}
function modPow(base: bigint, exp: bigint, mod: bigint) {
  let r = BigInt(1); let b = base % mod; let e = exp;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) r = (r * b) % mod;
    b = (b * b) % mod; e /= BigInt(2);
  }
  return r;
}
function modInv(a: bigint, m: bigint) {
  let m0 = m; let x0 = BigInt(0); let x1 = BigInt(1); let aa = a;
  while (aa > BigInt(1)) {
    const q = aa / m0; const t = m0; m0 = aa % m0; aa = t;
    const t2 = x0; x0 = x1 - q * x0; x1 = t2;
  }
  if (x1 < BigInt(0)) x1 += m;
  return x1;
}

export default function LabSignaturesPage() {
  /* Tool 25 */
  const [rsaSignMsg, setRsaSignMsg] = useState('Sign me');
  const [rsaSig, setRsaSig] = useState('');
  const [rsaVerifyOut, setRsaVerifyOut] = useState('');

  /* Tool 26 */
  const [dsaPriv, setDsaPriv] = useState('7');
  const [dsaPub, setDsaPub] = useState('');
  const [dsaMsg, setDsaMsg] = useState('DSA demo');
  const [dsaSig, setDsaSig] = useState('');
  const [dsaOut, setDsaOut] = useState('');

  /* Tool 27 */
  const [docSigner, setDocSigner] = useState('Cyber Analyst');
  const [docText, setDocText] = useState('Incident report');
  const [docPkg, setDocPkg] = useState('');

  /* Tool 28 */
  const [verifyDoc, setVerifyDoc] = useState('');
  const [verifyPkg, setVerifyPkg] = useState('');
  const [verifyOut, setVerifyOut] = useState('');

  /* Tool 29 */
  const [cert, setCert] = useState({ cn: 'localhost', org: 'CyberKit', c: 'US', days: '365' });
  const [certOut, setCertOut] = useState('');

  async function rsaSign() {
    const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(rsaSignMsg));
    const pub = await crypto.subtle.exportKey('spki', pair.publicKey);
    setRsaSig(JSON.stringify({ signature: btoa(String.fromCharCode(...new Uint8Array(sig))), publicKeyPem: toPem(btoa(String.fromCharCode(...new Uint8Array(pub))), 'PUBLIC KEY') }, null, 2));
    setRsaVerifyOut('');
  }
  async function rsaVerify() {
    try {
      const data = JSON.parse(rsaSig) as { signature: string; publicKeyPem: string };
      const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(fromPem(data.publicKeyPem)), (c) => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
      const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, Uint8Array.from(atob(data.signature), (c) => c.charCodeAt(0)), new TextEncoder().encode(rsaSignMsg));
      setRsaVerifyOut(ok ? 'RSA signature valid ✓' : 'RSA signature invalid ✗');
    } catch { setRsaVerifyOut('Invalid signature payload'); }
  }

  function dsaPubGen() {
    const p = BigInt(47); const q = BigInt(23); const g = BigInt(4);
    const x = BigInt(dsaPriv || '1') % q;
    setDsaPub(modPow(g, x, p).toString());
  }
  function dsaSignRun() {
    const p = BigInt(47); const q = BigInt(23); const g = BigInt(4);
    const x = BigInt(dsaPriv || '1') % q;
    const h = BigInt(`0x${CryptoJS.SHA256(dsaMsg).toString()}`) % q;
    const k = BigInt(5);
    const r = modPow(g, k, p) % q;
    const s = (modInv(k, q) * (h + x * r)) % q;
    setDsaSig(`${r},${s}`);
  }
  function dsaVerifyRun() {
    try {
      const p = BigInt(47); const q = BigInt(23); const g = BigInt(4); const y = BigInt(dsaPub);
      const [rStr, sStr] = dsaSig.split(','); const r = BigInt(rStr); const s = BigInt(sStr);
      const h = BigInt(`0x${CryptoJS.SHA256(dsaMsg).toString()}`) % q;
      const w = modInv(s, q); const u1 = (h * w) % q; const u2 = (r * w) % q;
      const v = ((modPow(g, u1, p) * modPow(y, u2, p)) % p) % q;
      setDsaOut(v === r ? 'DSA signature valid ✓' : 'DSA signature invalid ✗');
    } catch { setDsaOut('Invalid DSA values'); }
  }

  function makeDocPackage() {
    const t = new Date().toISOString();
    const digest = CryptoJS.SHA256(docText).toString();
    const sig = CryptoJS.SHA256(`${docSigner}|${t}|${digest}`).toString();
    setDocPkg(JSON.stringify({ signer: docSigner, timestamp: t, digest, signature: sig }, null, 2));
  }
  function verifyDocPackage() {
    try {
      const d = JSON.parse(verifyPkg) as { signer: string; timestamp: string; digest: string; signature: string };
      const digest = CryptoJS.SHA256(verifyDoc).toString();
      if (digest !== d.digest) { setVerifyOut('Document hash mismatch ✗'); return; }
      const exp = CryptoJS.SHA256(`${d.signer}|${d.timestamp}|${digest}`).toString();
      setVerifyOut(exp === d.signature ? 'Signature package valid ✓' : 'Signature mismatch ✗');
    } catch { setVerifyOut('Invalid package JSON'); }
  }
  async function certGen() {
    const r = await fetch('/api/tools/crypto/cert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commonName: cert.cn, organization: cert.org, country: cert.c, days: Number(cert.days) }) });
    const d = await r.json();
    setCertOut(JSON.stringify(d, null, 2));
  }

  return (
    <ToolLayout
      title="Digital Signature Tools"
      description="RSA digital signer/verifier, DSA educational tool, document signer simulator, signature verifier, and X.509 certificate generator."
      icon={<Shield className="h-5 w-5 text-primary" />}
      category="Tool Lab"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 25 */}
        <Section title="Tool 25 — RSA Digital Signer / Verifier" description="Generates a fresh RSA-2048 key pair, signs your message, and verifies the signature.">
          <Label>Message</Label>
          <Textarea value={rsaSignMsg} onChange={(e) => setRsaSignMsg(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button onClick={rsaSign}>Sign</Button>
            <Button variant="secondary" onClick={rsaVerify} disabled={!rsaSig}>Verify</Button>
          </div>
          {rsaSig && (
            <div className="space-y-1">
              <Label>Signature package (JSON)</Label>
              <Textarea value={rsaSig} onChange={(e) => setRsaSig(e.target.value)} className="min-h-[100px] font-mono text-xs" />
            </div>
          )}
          <Result value={rsaVerifyOut} />
        </Section>

        {/* Tool 26 */}
        <Section title="Tool 26 — DSA Tool (Educational)" description="Toy DSA parameters (p=47, q=23, g=4). Generate public key, sign a message, and verify.">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Private key (x)</Label>
              <Input value={dsaPriv} onChange={(e) => setDsaPriv(e.target.value)} />
            </div>
            <div>
              <Label>Public key (y)</Label>
              <Input value={dsaPub} onChange={(e) => setDsaPub(e.target.value)} />
            </div>
          </div>
          <Label>Message</Label>
          <Textarea value={dsaMsg} onChange={(e) => setDsaMsg(e.target.value)} rows={2} />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={dsaPubGen}>Generate Public</Button>
            <Button onClick={dsaSignRun}>Sign</Button>
            <Button variant="secondary" onClick={dsaVerifyRun} disabled={!dsaSig || !dsaPub}>Verify</Button>
          </div>
          <Label>Signature (r,s)</Label>
          <Input value={dsaSig} onChange={(e) => setDsaSig(e.target.value)} placeholder="r,s" className="font-mono text-xs" />
          <Result value={dsaOut} />
        </Section>

        {/* Tool 27 */}
        <Section title="Tool 27 — Document Signer Simulator" description="Creates a signed document package with SHA-256 digest and HMAC-style timestamp signature.">
          <Label>Signer name</Label>
          <Input value={docSigner} onChange={(e) => setDocSigner(e.target.value)} />
          <Label>Document content</Label>
          <Textarea value={docText} onChange={(e) => setDocText(e.target.value)} rows={3} />
          <Button onClick={makeDocPackage}>Generate Package</Button>
          {docPkg && (
            <div className="space-y-1">
              <Label>Signed package (JSON)</Label>
              <Textarea value={docPkg} onChange={(e) => setDocPkg(e.target.value)} className="min-h-[120px] font-mono text-xs" />
            </div>
          )}
        </Section>

        {/* Tool 28 */}
        <Section title="Tool 28 — Signature Verifier Tool" description="Verify a signed document package generated by Tool 27.">
          <Label>Document content</Label>
          <Textarea value={verifyDoc} onChange={(e) => setVerifyDoc(e.target.value)} rows={3} placeholder="Paste document text…" />
          <Label>Package (JSON)</Label>
          <Textarea value={verifyPkg} onChange={(e) => setVerifyPkg(e.target.value)} className="min-h-[100px] font-mono text-xs" placeholder="Paste JSON package…" />
          <Button onClick={verifyDocPackage} disabled={!verifyDoc || !verifyPkg}>Verify</Button>
          <Result value={verifyOut} />
        </Section>
      </div>

      {/* Tool 29 — Full width */}
      <Section title="Tool 29 — Certificate Generator (Self-Signed X.509)" description="Calls the backend API to generate a self-signed TLS certificate and private key.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><Label>Common Name</Label><Input value={cert.cn} onChange={(e) => setCert({ ...cert, cn: e.target.value })} /></div>
          <div><Label>Organization</Label><Input value={cert.org} onChange={(e) => setCert({ ...cert, org: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={cert.c} onChange={(e) => setCert({ ...cert, c: e.target.value })} /></div>
          <div><Label>Validity (days)</Label><Input type="number" value={cert.days} onChange={(e) => setCert({ ...cert, days: e.target.value })} /></div>
        </div>
        <Button onClick={certGen}>Generate Certificate</Button>
        {certOut && (
          <div className="space-y-1">
            <Label>Certificate output</Label>
            <Textarea value={certOut} onChange={(e) => setCertOut(e.target.value)} className="min-h-[220px] font-mono text-xs" />
          </div>
        )}
      </Section>
    </ToolLayout>
  );
}
