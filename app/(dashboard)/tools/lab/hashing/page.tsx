'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Hash } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

export default function LabHashingPage() {
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [expectedHash, setExpectedHash] = useState('');
  const [rainbowHash, setRainbowHash] = useState('');
  const [rainbowOut, setRainbowOut] = useState('');

  async function computeHashes() {
    if (!hashFile) return;
    const ab = await hashFile.arrayBuffer();
    const wa = CryptoJS.lib.WordArray.create(ab as any);
    setHashes({
      md5: CryptoJS.MD5(wa).toString(),
      sha1: CryptoJS.SHA1(wa).toString(),
      sha256: CryptoJS.SHA256(wa).toString(),
      sha512: CryptoJS.SHA512(wa).toString(),
    });
  }

  function rainbowLookup() {
    const table = ['password', 'admin123', 'letmein', 'welcome1', 'cyberkit'];
    const found = table.find((p) => CryptoJS.SHA256(p).toString() === rainbowHash.trim().toLowerCase());
    setRainbowOut(found ? `Match found: "${found}"` : 'No match in demo table');
  }

  const sha256Match = expectedHash && hashes.sha256
    ? expectedHash.toLowerCase() === hashes.sha256.toLowerCase()
    : null;

  return (
    <ToolLayout
      title="Cryptographic Hashing Tools"
      description="Compute MD5 / SHA-1 / SHA-256 / SHA-512 file hashes, verify integrity, and simulate rainbow table lookups."
      icon={<Hash className="h-5 w-5 text-primary" />}
      category="Tool Lab"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 18 */}
        <Section title="Tool 18 — File Hash Checker / Integrity Verifier">
          <Label>Select file</Label>
          <Input type="file" onChange={(e) => setHashFile(e.target.files?.[0] ?? null)} />
          <Button onClick={computeHashes} disabled={!hashFile}>Compute Hashes</Button>

          {Object.keys(hashes).length > 0 && (
            <div className="rounded border border-border overflow-hidden divide-y divide-border">
              {Object.entries(hashes).map(([k, v]) => (
                <div key={k} className="flex gap-2 px-3 py-2 text-xs">
                  <span className="w-12 flex-shrink-0 font-medium uppercase text-muted-foreground">{k}</span>
                  <span className="font-mono break-all">{v}</span>
                </div>
              ))}
            </div>
          )}

          <Label>Expected SHA-256 (for verification)</Label>
          <Input
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste expected hash…"
            className="font-mono text-xs"
          />
          {sha256Match !== null && (
            <Badge variant={sha256Match ? 'success' : 'destructive'}>
              {sha256Match ? 'Hash Match ✓' : 'Hash Mismatch ✗'}
            </Badge>
          )}
        </Section>

        {/* Tool 19 */}
        <Section title="Tool 19 — Rainbow Table Attack Simulator (Educational)">
          <p className="text-xs text-muted-foreground">
            Tests a SHA-256 hash against a small demo dictionary: <code className="font-mono">password, admin123, letmein, welcome1, cyberkit</code>.
          </p>
          <Label>SHA-256 hash to look up</Label>
          <Input
            value={rainbowHash}
            onChange={(e) => setRainbowHash(e.target.value)}
            placeholder="e.g. 5e884898da28047…"
            className="font-mono text-xs"
          />
          <Button onClick={rainbowLookup} disabled={!rainbowHash}>Look Up</Button>
          {rainbowOut && (
            <p className={`text-sm font-medium ${rainbowOut.startsWith('Match') ? 'text-destructive' : 'text-cyber-green'}`}>
              {rainbowOut}
            </p>
          )}
        </Section>
      </div>
    </ToolLayout>
  );
}
