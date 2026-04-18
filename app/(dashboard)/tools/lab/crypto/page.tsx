'use client';

import { useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Key } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/* ── helpers ── */
function shift(ch: string, s: number) {
  const c = ch.charCodeAt(0);
  if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + s + 26) % 26) + 65);
  if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + s + 26) % 26) + 97);
  return ch;
}
function caesar(text: string, s: number, dec = false) {
  const v = dec ? -s : s;
  return text.split('').map((c) => shift(c, v)).join('');
}
function vigenere(text: string, key: string, dec = false) {
  const k = key.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!k) return text;
  let i = 0;
  return text.split('').map((c) => {
    if (!/[A-Za-z]/.test(c)) return c;
    const s = k.charCodeAt(i % k.length) - 65;
    i += 1;
    return shift(c, dec ? -s : s);
  }).join('');
}
function railEnc(text: string, rails: number) {
  if (rails < 2) return text;
  const r = Array.from({ length: rails }, () => '' as string);
  let row = 0; let d = 1;
  for (const ch of text) {
    r[row] += ch; row += d;
    if (row === rails - 1 || row === 0) d *= -1;
  }
  return r.join('');
}
function railDec(cipher: string, rails: number) {
  if (rails < 2) return cipher;
  const pattern: number[] = [];
  let row = 0; let d = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    pattern.push(row); row += d;
    if (row === rails - 1 || row === 0) d *= -1;
  }
  const counts = Array.from({ length: rails }, () => 0);
  pattern.forEach((p) => { counts[p] += 1; });
  const rows: string[][] = [];
  let idx = 0;
  for (let i = 0; i < rails; i += 1) {
    rows.push(cipher.slice(idx, idx + counts[i]).split(''));
    idx += counts[i];
  }
  return pattern.map((p) => rows[p].shift() ?? '').join('');
}
function playfair(text: string, key: string, dec = false) {
  const alpha = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const seed = `${key.toUpperCase().replace(/J/g, 'I')}${alpha}`.replace(/[^A-Z]/g, '');
  const uniq: string[] = [];
  for (const c of seed) if (!uniq.includes(c)) uniq.push(c);
  const m = Array.from({ length: 5 }, (_, r) => uniq.slice(r * 5, r * 5 + 5));
  const p: Record<string, { r: number; c: number }> = {};
  m.forEach((row, r) => row.forEach((c, i) => { p[c] = { r, c: i }; }));
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs: string[] = [];
  for (let i = 0; i < clean.length; i += 1) {
    const a = clean[i]; let b = clean[i + 1];
    if (!b || a === b) b = 'X'; else i += 1;
    pairs.push(a + b);
  }
  const out: string[] = [];
  pairs.forEach((pair) => {
    const a = p[pair[0]]; const b = p[pair[1]]; const s = dec ? -1 : 1;
    if (a.r === b.r) out.push(m[a.r][(a.c + s + 5) % 5], m[b.r][(b.c + s + 5) % 5]);
    else if (a.c === b.c) out.push(m[(a.r + s + 5) % 5][a.c], m[(b.r + s + 5) % 5][b.c]);
    else out.push(m[a.r][b.c], m[b.r][a.c]);
  });
  return out.join('');
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
const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
function scorePassword(v: string) {
  const checks = [/[A-Z]/.test(v), /[a-z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v), v.length >= 12, !/(password|qwerty|12345|admin)/i.test(v)];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Fair';
  if (score <= 5) return 'Good';
  return 'Strong';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono break-all bg-muted/60 rounded px-2 py-1">{value || '—'}</span>
    </div>
  );
}

export default function LabCryptoPage() {
  const [plain, setPlain] = useState('HELLO CYBERKIT');
  const [shiftVal, setShiftVal] = useState(3);
  const [vigKey, setVigKey] = useState('CYBER');
  const [rails, setRails] = useState(3);
  const [pfKey, setPfKey] = useState('SECURITY');
  const [desKey, setDesKey] = useState('secret');
  const [desMode, setDesMode] = useState<'des' | '3des'>('des');
  const [desCipher, setDesCipher] = useState('');
  const [rsaPub, setRsaPub] = useState('');
  const [rsaPriv, setRsaPriv] = useState('');
  const [rsaCipher, setRsaCipher] = useState('');
  const [dh, setDh] = useState({ p: '23', g: '5', a: '6', b: '15' });
  const [dhOut, setDhOut] = useState('');
  const [morseInput, setMorseInput] = useState('SOS 123');
  const [password, setPassword] = useState('P@ssw0rd123');

  const caesarEnc = useMemo(() => caesar(plain, shiftVal), [plain, shiftVal]);
  const caesarDec = useMemo(() => caesar(caesarEnc, shiftVal, true), [caesarEnc, shiftVal]);
  const vigEnc = useMemo(() => vigenere(plain, vigKey), [plain, vigKey]);
  const vigDec = useMemo(() => vigenere(vigEnc, vigKey, true), [vigEnc, vigKey]);
  const railE = useMemo(() => railEnc(plain, rails), [plain, rails]);
  const railD = useMemo(() => railDec(railE, rails), [railE, rails]);
  const pfE = useMemo(() => playfair(plain, pfKey), [plain, pfKey]);
  const pfD = useMemo(() => playfair(pfE, pfKey, true), [pfE, pfKey]);
  const morseEnc = useMemo(() => morseInput.toUpperCase().split('').map((c) => MORSE[c] ?? '?').join(' '), [morseInput]);
  const morseDec = useMemo(() => morseInput.trim().split(/\s+/).map((t) => MORSE_REV[t] ?? '?').join('').replace(/\//g, ' '), [morseInput]);

  async function generateRsa() {
    const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
    const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
    setRsaPub(toPem(btoa(String.fromCharCode(...new Uint8Array(spki))), 'PUBLIC KEY'));
    setRsaPriv(toPem(btoa(String.fromCharCode(...new Uint8Array(pkcs8))), 'PRIVATE KEY'));
  }
  async function rsaEncrypt() {
    const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(fromPem(rsaPub)), (c) => c.charCodeAt(0)), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
    const enc = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(plain));
    setRsaCipher(btoa(String.fromCharCode(...new Uint8Array(enc))));
  }
  async function rsaDecrypt() {
    const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(fromPem(rsaPriv)), (c) => c.charCodeAt(0)), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
    const dec = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, Uint8Array.from(atob(rsaCipher), (c) => c.charCodeAt(0)));
    setPlain(new TextDecoder().decode(dec));
  }
  function runDh() {
    const p = BigInt(dh.p); const g = BigInt(dh.g); const a = BigInt(dh.a); const b = BigInt(dh.b);
    const A = modPow(g, a, p); const B = modPow(g, b, p);
    const s1 = modPow(B, a, p); const s2 = modPow(A, b, p);
    setDhOut(`PublicA=${A}  PublicB=${B}  SharedA=${s1}  SharedB=${s2}`);
  }

  const pwStrength = scorePassword(password);

  return (
    <ToolLayout
      title="Cryptography Tools"
      description="Classical & modern ciphers: Caesar, Vigenere, Rail Fence, Playfair, DES/3DES, RSA, Diffie-Hellman, Morse, Password Strength."
      icon={<Key className="h-5 w-5 text-primary" />}
      category="Tool Lab"
    >
      {/* Shared input */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <Label>Shared Plaintext Input</Label>
        <Textarea value={plain} onChange={(e) => setPlain(e.target.value)} rows={2} />
        <p className="text-xs text-muted-foreground">Used by classical ciphers and RSA encrypt/decrypt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 01 */}
        <Section title="Tool 01 — Caesar Cipher">
          <Label>Shift</Label>
          <Input type="number" value={shiftVal} onChange={(e) => setShiftVal(Number(e.target.value))} />
          <Row label="Encrypted" value={caesarEnc} />
          <Row label="Decrypted" value={caesarDec} />
        </Section>

        {/* Tool 02 */}
        <Section title="Tool 02 — Vigenere Cipher">
          <Label>Keyword</Label>
          <Input value={vigKey} onChange={(e) => setVigKey(e.target.value)} />
          <Row label="Encrypted" value={vigEnc} />
          <Row label="Decrypted" value={vigDec} />
        </Section>

        {/* Tool 03 */}
        <Section title="Tool 03 — Rail Fence Cipher">
          <Label>Rails (min 2)</Label>
          <Input type="number" value={rails} min={2} onChange={(e) => setRails(Number(e.target.value))} />
          <Row label="Encrypted" value={railE} />
          <Row label="Decrypted" value={railD} />
        </Section>

        {/* Tool 04 */}
        <Section title="Tool 04 — Playfair Cipher">
          <Label>Key Phrase</Label>
          <Input value={pfKey} onChange={(e) => setPfKey(e.target.value)} />
          <Row label="Encrypted" value={pfE} />
          <Row label="Decrypted" value={pfD} />
        </Section>

        {/* Tool 05 */}
        <Section title="Tool 05 — DES / 3DES">
          <Label>Mode</Label>
          <Select value={desMode} onChange={(e) => setDesMode(e.target.value as 'des' | '3des')}>
            <option value="des">DES</option>
            <option value="3des">3DES</option>
          </Select>
          <Label>Key</Label>
          <Input value={desKey} onChange={(e) => setDesKey(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => setDesCipher(desMode === 'des' ? CryptoJS.DES.encrypt(plain, desKey).toString() : CryptoJS.TripleDES.encrypt(plain, desKey).toString())}>Encrypt</Button>
            <Button variant="secondary" onClick={() => setPlain((desMode === 'des' ? CryptoJS.DES.decrypt(desCipher, desKey) : CryptoJS.TripleDES.decrypt(desCipher, desKey)).toString(CryptoJS.enc.Utf8) || '[failed]')}>Decrypt</Button>
          </div>
          <Label>Ciphertext</Label>
          <Textarea value={desCipher} onChange={(e) => setDesCipher(e.target.value)} rows={2} />
        </Section>

        {/* Tool 07 */}
        <Section title="Tool 07 — Diffie-Hellman Simulator">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>p</Label><Input value={dh.p} onChange={(e) => setDh({ ...dh, p: e.target.value })} /></div>
            <div><Label>g</Label><Input value={dh.g} onChange={(e) => setDh({ ...dh, g: e.target.value })} /></div>
            <div><Label>Private A</Label><Input value={dh.a} onChange={(e) => setDh({ ...dh, a: e.target.value })} /></div>
            <div><Label>Private B</Label><Input value={dh.b} onChange={(e) => setDh({ ...dh, b: e.target.value })} /></div>
          </div>
          <Button onClick={runDh}>Compute</Button>
          {dhOut && <p className="text-xs font-mono bg-muted/60 rounded px-2 py-1 break-all">{dhOut}</p>}
        </Section>

        {/* Tool 08 */}
        <Section title="Tool 08 — Morse Code Converter">
          <Label>Input (plain text or morse tokens)</Label>
          <Textarea value={morseInput} onChange={(e) => setMorseInput(e.target.value)} rows={2} />
          <Row label="Morse Encoded" value={morseEnc} />
          <Row label="Morse Decoded" value={morseDec} />
        </Section>

        {/* Tool 09 */}
        <Section title="Tool 09 — Password Strength Analyzer">
          <Label>Password</Label>
          <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Badge variant={pwStrength === 'Strong' ? 'success' : pwStrength === 'Weak' ? 'destructive' : 'warning'}>
            {pwStrength}
          </Badge>
          <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
            {[
              { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
              { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
              { label: 'Number', ok: /[0-9]/.test(password) },
              { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
              { label: '12+ characters', ok: password.length >= 12 },
              { label: 'No common words', ok: !/(password|qwerty|12345|admin)/i.test(password) },
            ].map((c) => (
              <li key={c.label} className={c.ok ? 'text-cyber-green' : ''}>
                {c.ok ? '✓' : '✗'} {c.label}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Tool 06 — RSA (full width) */}
      <Section title="Tool 06 — RSA Key Generator & Encryptor/Decryptor">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={generateRsa}>Generate Keys</Button>
          <Button onClick={rsaEncrypt} disabled={!rsaPub}>Encrypt</Button>
          <Button variant="secondary" onClick={rsaDecrypt} disabled={!rsaPriv || !rsaCipher}>Decrypt</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Public Key (PEM)</Label>
            <Textarea value={rsaPub} onChange={(e) => setRsaPub(e.target.value)} className="min-h-[120px] font-mono text-xs" />
          </div>
          <div className="space-y-1">
            <Label>Private Key (PEM)</Label>
            <Textarea value={rsaPriv} onChange={(e) => setRsaPriv(e.target.value)} className="min-h-[120px] font-mono text-xs" />
          </div>
        </div>
        <Label>Ciphertext (Base64)</Label>
        <Textarea value={rsaCipher} onChange={(e) => setRsaCipher(e.target.value)} placeholder="Encrypted output appears here" rows={2} className="font-mono text-xs" />
      </Section>
    </ToolLayout>
  );
}
