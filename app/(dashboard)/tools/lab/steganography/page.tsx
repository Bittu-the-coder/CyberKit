'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
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

async function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('file read failed'));
    r.readAsDataURL(file);
  });
}

export default function LabSteganographyPage() {
  /* Tool 20 */
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgSecret, setImgSecret] = useState('');
  const [imgOut, setImgOut] = useState('');
  const [imgExtract, setImgExtract] = useState('');
  const [stegResult, setStegResult] = useState('');

  /* Tool 21 */
  const [metaFile, setMetaFile] = useState<File | null>(null);
  const [metaInfo, setMetaInfo] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaComment, setMetaComment] = useState('');

  /* Tool 22 */
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSecret, setAudioSecret] = useState('');
  const [audioExtract, setAudioExtract] = useState('');

  /* Tool 23 */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSecret, setVideoSecret] = useState('');
  const [videoExtract, setVideoExtract] = useState('');

  /* Tool 24 */
  const [wsCover, setWsCover] = useState('Cover text');
  const [wsSecret, setWsSecret] = useState('hidden');
  const [wsOut, setWsOut] = useState('');
  const [wsDecoded, setWsDecoded] = useState('');

  async function imageHide() {
    if (!imgFile || !imgSecret) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image(); el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed')); el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const bits = Array.from(new TextEncoder().encode(`${imgSecret}\0`)).map((b) => b.toString(2).padStart(8, '0')).join('');
    let bi = 0;
    for (let i = 0; i < d.data.length && bi < bits.length; i += 1) {
      if ((i + 1) % 4 === 0) continue;
      d.data[i] = (d.data[i] & 0xfe) | Number(bits[bi]); bi += 1;
    }
    ctx.putImageData(d, 0, 0);
    setImgOut(c.toDataURL('image/png'));
  }

  async function imageRead() {
    if (!imgFile) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image(); el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed')); el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let bits = '';
    for (let i = 0; i < d.length; i += 1) {
      if ((i + 1) % 4 === 0) continue; bits += String(d[i] & 1);
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      const v = parseInt(bits.slice(i, i + 8), 2); if (v === 0) break; bytes.push(v);
    }
    setImgExtract(new TextDecoder().decode(new Uint8Array(bytes)) || '[no payload]');
  }

  async function steganalysis() {
    if (!imgFile) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image(); el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed')); el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let ones = 0; let total = 0;
    for (let i = 0; i < d.length; i += 1) {
      if ((i + 1) % 4 === 0) continue; ones += d[i] & 1; total += 1;
    }
    const ratio = total ? ones / total : 0;
    setStegResult(`LSB ones ratio: ${ratio.toFixed(4)} — ${Math.abs(0.5 - ratio) < 0.02 ? 'possible embedded payload' : 'no strong anomaly'}`);
  }

  async function viewMeta() {
    if (!metaFile) return;
    setMetaInfo(JSON.stringify({ name: metaFile.name, type: metaFile.type, size: metaFile.size, lastModified: new Date(metaFile.lastModified).toISOString() }, null, 2));
  }
  async function stripMeta() {
    if (!metaFile) return;
    const url = await toDataUrl(metaFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image(); el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed')); el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = u; a.download = 'stripped-image.png'; a.click();
      URL.revokeObjectURL(u);
    }, 'image/png');
  }
  function exportMetaJson() {
    const blob = new Blob([JSON.stringify({ author: metaAuthor, comment: metaComment, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = u; a.download = 'image-metadata.json'; a.click();
    URL.revokeObjectURL(u);
  }

  async function embedCarrier(file: File | null, secret: string) {
    if (!file || !secret) return;
    const src = new Uint8Array(await file.arrayBuffer());
    const marker = new TextEncoder().encode('CYBERKIT_STEGO::');
    const payload = new TextEncoder().encode(secret);
    const out = new Uint8Array(src.length + marker.length + payload.length);
    out.set(src, 0); out.set(marker, src.length); out.set(payload, src.length + marker.length);
    const u = URL.createObjectURL(new Blob([out], { type: file.type || 'application/octet-stream' }));
    const a = document.createElement('a'); a.href = u; a.download = `stego-${file.name}`; a.click();
    URL.revokeObjectURL(u);
  }
  async function readCarrier(file: File | null, setOut: (v: string) => void) {
    if (!file) return;
    const txt = new TextDecoder().decode(new Uint8Array(await file.arrayBuffer()));
    const idx = txt.lastIndexOf('CYBERKIT_STEGO::');
    setOut(idx === -1 ? '[no payload]' : txt.slice(idx + 'CYBERKIT_STEGO::'.length));
  }

  function wsEncode() {
    const bits = Array.from(new TextEncoder().encode(`${wsSecret}\0`)).map((b) => b.toString(2).padStart(8, '0')).join('');
    setWsOut(`${wsCover}\n${bits.replace(/0/g, ' ').replace(/1/g, '\t')}`);
  }
  function wsDecode() {
    const tail = (wsOut || wsCover).match(/[ \t]+$/)?.[0] ?? '';
    const bits = tail.replace(/ /g, '0').replace(/\t/g, '1');
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      const v = parseInt(bits.slice(i, i + 8), 2); if (v === 0) break; bytes.push(v);
    }
    setWsDecoded(new TextDecoder().decode(new Uint8Array(bytes)) || '[no payload]');
  }

  return (
    <ToolLayout
      title="Steganography Tools"
      description="LSB image steganography, image metadata viewer/editor, audio & video carrier embedding, whitespace steganography."
      icon={<Lock className="h-5 w-5 text-primary" />}
      category="Tool Lab"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 20 */}
        <Section title="Tool 20 — LSB Image Steganography" description="Hide or extract a text secret in image pixel LSBs. Also run LSB anomaly analysis.">
          <Label>Image file</Label>
          <Input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files?.[0] ?? null)} />
          <Label>Secret text</Label>
          <Textarea value={imgSecret} onChange={(e) => setImgSecret(e.target.value)} rows={2} placeholder="Text to hide…" />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={imageHide} disabled={!imgFile || !imgSecret}>Hide & Download</Button>
            <Button variant="secondary" onClick={imageRead} disabled={!imgFile}>Extract</Button>
            <Button variant="outline" onClick={steganalysis} disabled={!imgFile}>Analyze LSB</Button>
          </div>
          {imgOut && <a href={imgOut} download="stego-image.png" className="text-xs text-primary hover:underline">↓ Download stego image</a>}
          {imgExtract && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1">Extracted: {imgExtract}</p>}
          {stegResult && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1">{stegResult}</p>}
        </Section>

        {/* Tool 21 */}
        <Section title="Tool 21 — Image Metadata Viewer / Editor" description="Inspect browser-visible metadata, strip it (canvas re-export), and export custom metadata JSON.">
          <Label>Image file</Label>
          <Input type="file" accept="image/*" onChange={(e) => setMetaFile(e.target.files?.[0] ?? null)} />
          <div className="flex gap-2">
            <Button onClick={viewMeta} disabled={!metaFile}>View Metadata</Button>
            <Button variant="secondary" onClick={stripMeta} disabled={!metaFile}>Strip & Download</Button>
          </div>
          {metaInfo && <Textarea value={metaInfo} onChange={(e) => setMetaInfo(e.target.value)} className="min-h-[80px] font-mono text-xs" />}
          <Label>Author (for export)</Label>
          <Input value={metaAuthor} onChange={(e) => setMetaAuthor(e.target.value)} />
          <Label>Comment (for export)</Label>
          <Input value={metaComment} onChange={(e) => setMetaComment(e.target.value)} />
          <Button variant="outline" onClick={exportMetaJson}>Export Metadata JSON</Button>
        </Section>

        {/* Tool 22 */}
        <Section title="Tool 22 — Audio Steganography (Basic)" description="Appends a text payload after a CYBERKIT_STEGO:: marker in the carrier file.">
          <Label>Audio file</Label>
          <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
          <Label>Secret text</Label>
          <Textarea value={audioSecret} onChange={(e) => setAudioSecret(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button onClick={() => embedCarrier(audioFile, audioSecret)} disabled={!audioFile || !audioSecret}>Embed & Download</Button>
            <Button variant="secondary" onClick={() => readCarrier(audioFile, setAudioExtract)} disabled={!audioFile}>Extract</Button>
          </div>
          {audioExtract && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1">Extracted: {audioExtract}</p>}
        </Section>

        {/* Tool 23 */}
        <Section title="Tool 23 — Video Steganography (Basic)" description="Appends a text payload after a CYBERKIT_STEGO:: marker in the carrier file.">
          <Label>Video file</Label>
          <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
          <Label>Secret text</Label>
          <Textarea value={videoSecret} onChange={(e) => setVideoSecret(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button onClick={() => embedCarrier(videoFile, videoSecret)} disabled={!videoFile || !videoSecret}>Embed & Download</Button>
            <Button variant="secondary" onClick={() => readCarrier(videoFile, setVideoExtract)} disabled={!videoFile}>Extract</Button>
          </div>
          {videoExtract && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1">Extracted: {videoExtract}</p>}
        </Section>

        {/* Tool 24 */}
        <Section title="Tool 24 — Whitespace Steganography" description="Hides a secret in trailing space/tab patterns appended to cover text.">
          <Label>Cover text</Label>
          <Textarea value={wsCover} onChange={(e) => setWsCover(e.target.value)} rows={2} />
          <Label>Secret text</Label>
          <Textarea value={wsSecret} onChange={(e) => setWsSecret(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button onClick={wsEncode}>Encode</Button>
            <Button variant="secondary" onClick={wsDecode}>Decode</Button>
          </div>
          {wsOut && (
            <div className="space-y-1">
              <Label>Encoded output (copy to share)</Label>
              <Textarea value={wsOut} onChange={(e) => setWsOut(e.target.value)} className="min-h-[60px] font-mono text-xs" />
            </div>
          )}
          {wsDecoded && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1">Decoded: {wsDecoded}</p>}
        </Section>
      </div>
    </ToolLayout>
  );
}
