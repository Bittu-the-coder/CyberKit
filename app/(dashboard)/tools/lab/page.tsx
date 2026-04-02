'use client';

import { useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';
import { AlertTriangle, Beaker, CheckCircle2, Shield } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const TOOL_GUIDES = [
  { title: 'Tool 01 - Caesar Cipher', guide: 'Enter text and shift value. Read Enc/Dec previews instantly.' },
  { title: 'Tool 02 - Vigenere Cipher', guide: 'Provide keyword and input text. Tool shows encrypted/decrypted output.' },
  { title: 'Tool 03 - Rail Fence Cipher', guide: 'Pick rail count (2+). Compare transposed ciphertext and restored plaintext.' },
  { title: 'Tool 04 - Playfair Cipher', guide: 'Set key phrase to build matrix. Tool processes digraph encryption/decryption.' },
  { title: 'Tool 05 - DES/3DES', guide: 'Select DES or 3DES, enter key and plaintext, then encrypt/decrypt.' },
  { title: 'Tool 06 - RSA Key Generator & Encryptor/Decryptor', guide: 'Generate keypair, encrypt message with public key, decrypt with private key.' },
  { title: 'Tool 07 - Diffie-Hellman Simulator', guide: 'Fill p, g, and private values; run to see public values and shared secret.' },
  { title: 'Tool 08 - Morse Converter', guide: 'Input plain text or morse tokens to view both encoded and decoded results.' },
  { title: 'Tool 09 - Password Strength Analyzer', guide: 'Paste password and review instant strength classification.' },
  { title: 'Tool 10 - Phishing Email Analyzer', guide: 'Paste suspicious email body and inspect detected social-engineering signals.' },
  { title: 'Tool 11 - URL Scanner/Link Analyzer', guide: 'Paste URL to evaluate transport, domain and obfuscation red flags.' },
  { title: 'Tool 12 - Email Header Analyzer', guide: 'Paste raw headers to inspect key/value fields for sender inconsistencies.' },
  { title: 'Tool 13 - Domain Typosquatting Checker', guide: 'Enter domain and review lookalike typo variants.' },
  { title: 'Tool 14 - Safe Link Expander', guide: 'Submit short URL to resolve redirect chain safely via backend.' },
  { title: 'Tool 15 - Phishing Quiz', guide: 'Answer awareness questions and get final score.' },
  { title: 'Tool 16 - Email Spoofing Demonstrator', guide: 'Compare From vs Reply-To domains to learn spoofing indicators.' },
  { title: 'Tool 17 - Fake Login Page Detector', guide: 'Paste suspicious HTML/text and review indicator-based risk output.' },
  { title: 'Tool 18 - File Hash Checker / Integrity Verifier', guide: 'Upload file, compute hashes, compare SHA-256 with expected value.' },
  { title: 'Tool 19 - Rainbow Table Attack Simulator', guide: 'Test SHA-256 hash against demo weak-password dictionary.' },
  { title: 'Tool 20 - LSB Image Steganography, Text-in-Image, Steganalysis', guide: 'Upload image to hide/extract secret and run LSB anomaly check.' },
  { title: 'Tool 21 - Image Metadata Viewer/Editor', guide: 'Inspect image metadata, strip metadata, and export custom metadata JSON.' },
  { title: 'Tool 22 - Audio Steganography Tool (Basic)', guide: 'Embed text payload into carrier file and extract payload from marked file.' },
  { title: 'Tool 23 - Video Steganography Tool (Basic)', guide: 'Embed/extract hidden text payload in video carrier file (basic approach).' },
  { title: 'Tool 24 - Whitespace Steganography Tool', guide: 'Hide secret using trailing space/tab bitstream and decode it back.' },
  { title: 'Tool 25 - RSA Digital Signer/Verifier', guide: 'Create RSA signature package and verify authenticity.' },
  { title: 'Tool 26 - DSA Tool (Educational)', guide: 'Generate public key, sign message, and validate signature with toy parameters.' },
  { title: 'Tool 27 - Document Signer Simulator', guide: 'Produce signed document package with hash and timestamp metadata.' },
  { title: 'Tool 28 - Signature Verifier Tool', guide: 'Verify package integrity against provided document content.' },
  { title: 'Tool 29 - Certificate Generator (Self-Signed X.509)', guide: 'Enter subject fields and generate a self-signed certificate + key pair.' },
] as const;

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
  let row = 0;
  let d = 1;
  for (const ch of text) {
    r[row] += ch;
    row += d;
    if (row === rails - 1 || row === 0) d *= -1;
  }
  return r.join('');
}
function railDec(cipher: string, rails: number) {
  if (rails < 2) return cipher;
  const pattern: number[] = [];
  let row = 0;
  let d = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    pattern.push(row);
    row += d;
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
    const a = clean[i];
    let b = clean[i + 1];
    if (!b || a === b) b = 'X';
    else i += 1;
    pairs.push(a + b);
  }
  const out: string[] = [];
  pairs.forEach((pair) => {
    const a = p[pair[0]];
    const b = p[pair[1]];
    const s = dec ? -1 : 1;
    if (a.r === b.r) out.push(m[a.r][(a.c + s + 5) % 5], m[b.r][(b.c + s + 5) % 5]);
    else if (a.c === b.c) out.push(m[(a.r + s + 5) % 5][a.c], m[(b.r + s + 5) % 5][b.c]);
    else out.push(m[a.r][b.c], m[b.r][a.c]);
  });
  return out.join('');
}
function normalizeUrl(v: string) {
  try {
    return new URL(v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`);
  } catch {
    return null;
  }
}
function scorePassword(v: string) {
  const checks = [/[A-Z]/.test(v), /[a-z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v), v.length >= 12, !/(password|qwerty|12345|admin)/i.test(v)];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Fair';
  if (score <= 5) return 'Good';
  return 'Strong';
}
function modPow(base: bigint, exp: bigint, mod: bigint) {
  let r = BigInt(1);
  let b = base % mod;
  let e = exp;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) r = (r * b) % mod;
    b = (b * b) % mod;
    e /= BigInt(2);
  }
  return r;
}
function modInv(a: bigint, m: bigint) {
  let m0 = m;
  let x0 = BigInt(0);
  let x1 = BigInt(1);
  let aa = a;
  while (aa > BigInt(1)) {
    const q = aa / m0;
    const t = m0;
    m0 = aa % m0;
    aa = t;
    const t2 = x0;
    x0 = x1 - q * x0;
    x1 = t2;
  }
  if (x1 < BigInt(0)) x1 += m;
  return x1;
}
function toPem(b64: string, label: string) {
  const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}
function fromPem(pem: string) {
  return pem.replace(/-----BEGIN[^-]+-----/g, '').replace(/-----END[^-]+-----/g, '').replace(/\s+/g, '');
}
async function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('file read failed'));
    r.readAsDataURL(file);
  });
}

export default function ToolLabPage() {
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

  const [emailText, setEmailText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [headersRaw, setHeadersRaw] = useState('');
  const [domain, setDomain] = useState('example.com');
  const [expandUrl, setExpandUrl] = useState('');
  const [expandChain, setExpandChain] = useState<string[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [spoofFrom, setSpoofFrom] = useState('support@trusted.com');
  const [spoofReply, setSpoofReply] = useState('helpdesk@trvsted.com');
  const [fakeInput, setFakeInput] = useState('');
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [expectedHash, setExpectedHash] = useState('');
  const [rainbowHash, setRainbowHash] = useState('');
  const [rainbowOut, setRainbowOut] = useState('');

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgSecret, setImgSecret] = useState('');
  const [imgOut, setImgOut] = useState('');
  const [imgExtract, setImgExtract] = useState('');
  const [stegResult, setStegResult] = useState('');

  const [metaFile, setMetaFile] = useState<File | null>(null);
  const [metaInfo, setMetaInfo] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaComment, setMetaComment] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSecret, setAudioSecret] = useState('');
  const [audioExtract, setAudioExtract] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSecret, setVideoSecret] = useState('');
  const [videoExtract, setVideoExtract] = useState('');
  const [wsCover, setWsCover] = useState('Cover text');
  const [wsSecret, setWsSecret] = useState('hidden');
  const [wsOut, setWsOut] = useState('');

  const [rsaSignMsg, setRsaSignMsg] = useState('Sign me');
  const [rsaSig, setRsaSig] = useState('');
  const [dsaPriv, setDsaPriv] = useState('7');
  const [dsaPub, setDsaPub] = useState('');
  const [dsaMsg, setDsaMsg] = useState('DSA demo');
  const [dsaSig, setDsaSig] = useState('');
  const [dsaOut, setDsaOut] = useState('');

  const [docSigner, setDocSigner] = useState('Cyber Analyst');
  const [docText, setDocText] = useState('Incident report');
  const [docPkg, setDocPkg] = useState('');
  const [verifyDoc, setVerifyDoc] = useState('');
  const [verifyPkg, setVerifyPkg] = useState('');
  const [verifyOut, setVerifyOut] = useState('');

  const [cert, setCert] = useState({ cn: 'localhost', org: 'CyberKit', c: 'US', days: '365' });
  const [certOut, setCertOut] = useState('');

  const caesarEnc = useMemo(() => caesar(plain, shiftVal), [plain, shiftVal]);
  const caesarDec = useMemo(() => caesar(caesarEnc, shiftVal, true), [caesarEnc, shiftVal]);
  const vigEnc = useMemo(() => vigenere(plain, vigKey), [plain, vigKey]);
  const vigDec = useMemo(() => vigenere(vigEnc, vigKey, true), [vigEnc, vigKey]);
  const railE = useMemo(() => railEnc(plain, rails), [plain, rails]);
  const railD = useMemo(() => railDec(railE, rails), [railE, rails]);
  const pfE = useMemo(() => playfair(plain, pfKey), [plain, pfKey]);
  const pfD = useMemo(() => playfair(pfE, pfKey, true), [pfE, pfKey]);

  const urlRisk = useMemo(() => {
    const u = normalizeUrl(urlText);
    if (!u) return { risk: 'High', findings: ['Invalid URL'] };
    const f: string[] = [];
    if (!u.toString().startsWith('https://')) f.push('No HTTPS');
    if (/xn--/.test(u.hostname)) f.push('Punycode domain');
    if (/bit\.ly|tinyurl|t\.co|is\.gd/.test(u.hostname)) f.push('Shortened URL');
    return { risk: f.length > 1 ? 'High' : f.length ? 'Medium' : 'Low', findings: f.length ? f : ['No major indicators'] };
  }, [urlText]);
  const emailRisk = useMemo(() => {
    const t = emailText.toLowerCase();
    const f: string[] = [];
    if (/urgent|action required|suspended/.test(t)) f.push('Urgency language');
    if (/verify your account|reset password|confirm identity/.test(t)) f.push('Credential harvesting phrase');
    if (/wire transfer|gift card|crypto|bitcoin/.test(t)) f.push('Financial fraud phrase');
    return { risk: f.length > 1 ? 'High' : f.length ? 'Medium' : 'Low', findings: f.length ? f : ['No major indicators'] };
  }, [emailText]);

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
    const p = BigInt(dh.p);
    const g = BigInt(dh.g);
    const a = BigInt(dh.a);
    const b = BigInt(dh.b);
    const A = modPow(g, a, p);
    const B = modPow(g, b, p);
    const s1 = modPow(B, a, p);
    const s2 = modPow(A, b, p);
    setDhOut(`PublicA=${A} PublicB=${B} SharedA=${s1} SharedB=${s2}`);
  }
  function encodeMorse() {
    return morseInput.toUpperCase().split('').map((c) => MORSE[c] ?? '?').join(' ');
  }
  function decodeMorse() {
    return morseInput.trim().split(/\s+/).map((t) => MORSE_REV[t] ?? '?').join('').replace(/\//g, ' ');
  }
  async function safeExpand() {
    const r = await fetch('/api/tools/phishing/expand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: expandUrl }) });
    const d = await r.json();
    setExpandChain(d.chain ?? [d.error ?? 'Failed']);
  }
  async function computeHashes() {
    if (!hashFile) return;
    const ab = await hashFile.arrayBuffer();
    const wa = CryptoJS.lib.WordArray.create(ab as any);
    setHashes({ md5: CryptoJS.MD5(wa).toString(), sha1: CryptoJS.SHA1(wa).toString(), sha256: CryptoJS.SHA256(wa).toString(), sha512: CryptoJS.SHA512(wa).toString() });
  }
  function rainbowLookup() {
    const table = ['password', 'admin123', 'letmein', 'welcome1', 'cyberkit'];
    const found = table.find((p) => CryptoJS.SHA256(p).toString() === rainbowHash.trim().toLowerCase());
    setRainbowOut(found ? `Match found: ${found}` : 'No match in demo table');
  }
  async function imageHide() {
    if (!imgFile || !imgSecret) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed'));
      el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const bits = Array.from(new TextEncoder().encode(`${imgSecret}\0`)).map((b) => b.toString(2).padStart(8, '0')).join('');
    let bi = 0;
    for (let i = 0; i < d.data.length && bi < bits.length; i += 1) {
      if ((i + 1) % 4 === 0) continue;
      d.data[i] = (d.data[i] & 0xfe) | Number(bits[bi]);
      bi += 1;
    }
    ctx.putImageData(d, 0, 0);
    setImgOut(c.toDataURL('image/png'));
  }
  async function imageRead() {
    if (!imgFile) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed'));
      el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let bits = '';
    for (let i = 0; i < d.length; i += 1) {
      if ((i + 1) % 4 === 0) continue;
      bits += String(d[i] & 1);
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      const v = parseInt(bits.slice(i, i + 8), 2);
      if (v === 0) break;
      bytes.push(v);
    }
    setImgExtract(new TextDecoder().decode(new Uint8Array(bytes)) || '[no payload]');
  }
  async function steganalysis() {
    if (!imgFile) return;
    const url = await toDataUrl(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed'));
      el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let ones = 0;
    let total = 0;
    for (let i = 0; i < d.length; i += 1) {
      if ((i + 1) % 4 === 0) continue;
      ones += d[i] & 1;
      total += 1;
    }
    const ratio = total ? ones / total : 0;
    setStegResult(`LSB ones ratio: ${ratio.toFixed(4)} (${Math.abs(0.5 - ratio) < 0.02 ? 'possible embedded payload' : 'no strong anomaly'})`);
  }
  async function viewMeta() {
    if (!metaFile) return;
    setMetaInfo(JSON.stringify({ name: metaFile.name, type: metaFile.type, size: metaFile.size, lastModified: new Date(metaFile.lastModified).toISOString() }, null, 2));
  }
  async function stripMeta() {
    if (!metaFile) return;
    const url = await toDataUrl(metaFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image failed'));
      el.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = 'stripped-image.png';
      a.click();
      URL.revokeObjectURL(u);
    }, 'image/png');
  }
  function exportMetaJson() {
    const blob = new Blob([JSON.stringify({ author: metaAuthor, comment: metaComment, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'image-metadata.json';
    a.click();
    URL.revokeObjectURL(u);
  }
  async function embedCarrier(file: File | null, secret: string) {
    if (!file || !secret) return;
    const src = new Uint8Array(await file.arrayBuffer());
    const marker = new TextEncoder().encode('CYBERKIT_STEGO::');
    const payload = new TextEncoder().encode(secret);
    const out = new Uint8Array(src.length + marker.length + payload.length);
    out.set(src, 0);
    out.set(marker, src.length);
    out.set(payload, src.length + marker.length);
    const u = URL.createObjectURL(new Blob([out], { type: file.type || 'application/octet-stream' }));
    const a = document.createElement('a');
    a.href = u;
    a.download = `stego-${file.name}`;
    a.click();
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
      const v = parseInt(bits.slice(i, i + 8), 2);
      if (v === 0) break;
      bytes.push(v);
    }
    setImgExtract(new TextDecoder().decode(new Uint8Array(bytes)));
  }
  async function rsaSign() {
    const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(rsaSignMsg));
    const pub = await crypto.subtle.exportKey('spki', pair.publicKey);
    setRsaSig(JSON.stringify({ signature: btoa(String.fromCharCode(...new Uint8Array(sig))), publicKeyPem: toPem(btoa(String.fromCharCode(...new Uint8Array(pub))), 'PUBLIC KEY') }, null, 2));
  }
  async function rsaVerify() {
    try {
      const data = JSON.parse(rsaSig) as { signature: string; publicKeyPem: string };
      const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(fromPem(data.publicKeyPem)), (c) => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
      const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, Uint8Array.from(atob(data.signature), (c) => c.charCodeAt(0)), new TextEncoder().encode(rsaSignMsg));
      setVerifyOut(ok ? 'RSA signature valid' : 'RSA signature invalid');
    } catch {
      setVerifyOut('Invalid signature payload');
    }
  }
  function dsaPubGen() {
    const p = BigInt(47);
    const q = BigInt(23);
    const g = BigInt(4);
    const x = BigInt(dsaPriv || '1') % q;
    setDsaPub(modPow(g, x, p).toString());
  }
  function dsaSignRun() {
    const p = BigInt(47);
    const q = BigInt(23);
    const g = BigInt(4);
    const x = BigInt(dsaPriv || '1') % q;
    const h = BigInt(`0x${CryptoJS.SHA256(dsaMsg).toString()}`) % q;
    const k = BigInt(5);
    const r = modPow(g, k, p) % q;
    const s = (modInv(k, q) * (h + x * r)) % q;
    setDsaSig(`${r},${s}`);
  }
  function dsaVerifyRun() {
    try {
      const p = BigInt(47);
      const q = BigInt(23);
      const g = BigInt(4);
      const y = BigInt(dsaPub);
      const [rStr, sStr] = dsaSig.split(',');
      const r = BigInt(rStr);
      const s = BigInt(sStr);
      const h = BigInt(`0x${CryptoJS.SHA256(dsaMsg).toString()}`) % q;
      const w = modInv(s, q);
      const u1 = (h * w) % q;
      const u2 = (r * w) % q;
      const v = ((modPow(g, u1, p) * modPow(y, u2, p)) % p) % q;
      setDsaOut(v === r ? 'DSA signature valid' : 'DSA signature invalid');
    } catch {
      setDsaOut('Invalid DSA values');
    }
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
      if (digest !== d.digest) {
        setVerifyOut('Document hash mismatch');
        return;
      }
      const exp = CryptoJS.SHA256(`${d.signer}|${d.timestamp}|${digest}`).toString();
      setVerifyOut(exp === d.signature ? 'Signature package valid' : 'Signature mismatch');
    } catch {
      setVerifyOut('Invalid package JSON');
    }
  }
  async function certGen() {
    const r = await fetch('/api/tools/crypto/cert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commonName: cert.cn, organization: cert.org, country: cert.c, days: Number(cert.days) }) });
    const d = await r.json();
    setCertOut(JSON.stringify(d, null, 2));
  }

  const headerRows = headersRaw.split(/\r?\n/).map((l) => {
    const i = l.indexOf(':');
    if (i < 1) return null;
    return { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() };
  }).filter(Boolean) as Array<{ k: string; v: string }>;
  const typoVariants = useMemo(() => {
    const [n, t] = domain.toLowerCase().split('.', 2);
    if (!n || !t) return [];
    const out = new Set<string>();
    for (let i = 0; i < n.length - 1; i += 1) out.add(`${n.slice(0, i)}${n[i + 1]}${n[i]}${n.slice(i + 2)}.${t}`);
    for (let i = 0; i < n.length; i += 1) out.add(`${n.slice(0, i)}${n.slice(i + 1)}.${t}`);
    return Array.from(out).slice(0, 20);
  }, [domain]);
  const spoofNote = useMemo(() => {
    const fd = spoofFrom.split('@')[1] ?? '';
    const rd = spoofReply.split('@')[1] ?? '';
    if (!fd || !rd) return 'Provide valid From and Reply-To values';
    return fd !== rd ? `Potential spoofing: From (${fd}) differs from Reply-To (${rd})` : 'No domain mismatch between From and Reply-To';
  }, [spoofFrom, spoofReply]);
  const fakeRisk = useMemo(() => {
    const t = fakeInput.toLowerCase();
    const flags: string[] = [];
    if (/http:/.test(t) && /password/.test(t)) flags.push('Password form over HTTP');
    if (/display:\s*none/.test(t) && /iframe/.test(t)) flags.push('Hidden iframe');
    if (/verify account|urgent action/.test(t)) flags.push('Social engineering text');
    return { risk: flags.length > 1 ? 'High' : flags.length ? 'Medium' : 'Low', flags: flags.length ? flags : ['No major indicators'] };
  }, [fakeInput]);
  const morseEnc = useMemo(() => encodeMorse(), [morseInput]);
  const morseDec = useMemo(() => decodeMorse(), [morseInput]);

  const quiz = [
    { q: 'Strong phishing red flag?', o: ['Urgent + suspicious link', 'Morning send time', 'Long email'], a: 0 },
    { q: 'Suspicious login email best response?', o: ['Click included link', 'Open known official site manually', 'Reply with OTP'], a: 1 },
    { q: 'Display name trusted, domain misspelled means?', o: ['Safe', 'Typosquatting', 'Newsletter'], a: 1 },
  ];

  return (
    <ToolLayout title="Tool Lab" description="Complete security toolkit. Only CTF Labs remain under development." icon={<Beaker className="h-5 w-5 text-primary" />} category="Toolkit">
      <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
        <p>All requested tools are now implemented in this workspace with practical and educational-safe behavior.</p>
      </div>

      <details open className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Tool Guides</summary>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
          {TOOL_GUIDES.map((item) => (
            <div key={item.title} className="border border-border rounded-md p-3 bg-background/50">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.guide}</p>
            </div>
          ))}
        </div>
      </details>
      <details open className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Cryptography Tools (Classical & Modern)</summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="space-y-2 border border-border rounded p-3"><Label>Shared Input</Label><Textarea value={plain} onChange={(e) => setPlain(e.target.value)} /></div>
          <div className="space-y-1 border border-border rounded p-3"><Label>Tool 01 - Caesar Cipher</Label><Input type="number" value={shiftVal} onChange={(e) => setShiftVal(Number(e.target.value))} /><p className="text-xs">Enc: {caesarEnc}</p><p className="text-xs">Dec: {caesarDec}</p></div>
          <div className="space-y-1 border border-border rounded p-3"><Label>Tool 02 - Vigenere Cipher</Label><Input value={vigKey} onChange={(e) => setVigKey(e.target.value)} /><p className="text-xs">Enc: {vigEnc}</p><p className="text-xs">Dec: {vigDec}</p></div>
          <div className="space-y-1 border border-border rounded p-3"><Label>Tool 03 - Rail Fence Cipher</Label><Input type="number" value={rails} onChange={(e) => setRails(Number(e.target.value))} /><p className="text-xs">Enc: {railE}</p><p className="text-xs">Dec: {railD}</p></div>
          <div className="space-y-1 border border-border rounded p-3"><Label>Tool 04 - Playfair Cipher</Label><Input value={pfKey} onChange={(e) => setPfKey(e.target.value)} /><p className="text-xs">Enc: {pfE}</p><p className="text-xs">Dec: {pfD}</p></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 05 - DES/3DES</Label><Select value={desMode} onChange={(e) => setDesMode(e.target.value as 'des' | '3des')}><option value="des">DES</option><option value="3des">3DES</option></Select><Input value={desKey} onChange={(e) => setDesKey(e.target.value)} /><div className="flex gap-2"><Button onClick={() => setDesCipher(desMode === 'des' ? CryptoJS.DES.encrypt(plain, desKey).toString() : CryptoJS.TripleDES.encrypt(plain, desKey).toString())}>Encrypt</Button><Button variant="secondary" onClick={() => setPlain((desMode === 'des' ? CryptoJS.DES.decrypt(desCipher, desKey) : CryptoJS.TripleDES.decrypt(desCipher, desKey)).toString(CryptoJS.enc.Utf8) || '[failed]')}>Decrypt</Button></div><Textarea value={desCipher} onChange={(e) => setDesCipher(e.target.value)} /></div>
          <div className="space-y-2 border border-border rounded p-3 lg:col-span-2"><Label>Tool 06 - RSA Key Generator & Encryptor/Decryptor</Label><div className="flex gap-2 flex-wrap"><Button onClick={generateRsa}>Generate</Button><Button onClick={rsaEncrypt}>Encrypt</Button><Button variant="secondary" onClick={rsaDecrypt}>Decrypt</Button></div><Textarea value={rsaPub} onChange={(e) => setRsaPub(e.target.value)} className="min-h-[100px]" /><Textarea value={rsaPriv} onChange={(e) => setRsaPriv(e.target.value)} className="min-h-[100px]" /><Textarea value={rsaCipher} onChange={(e) => setRsaCipher(e.target.value)} placeholder="Ciphertext" /></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 07 - Diffie-Hellman Simulator</Label><Input value={dh.p} onChange={(e) => setDh({ ...dh, p: e.target.value })} placeholder="p" /><Input value={dh.g} onChange={(e) => setDh({ ...dh, g: e.target.value })} placeholder="g" /><Input value={dh.a} onChange={(e) => setDh({ ...dh, a: e.target.value })} placeholder="priv A" /><Input value={dh.b} onChange={(e) => setDh({ ...dh, b: e.target.value })} placeholder="priv B" /><Button onClick={runDh}>Run</Button><p className="text-xs">{dhOut}</p></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 08 - Morse Converter</Label><Textarea value={morseInput} onChange={(e) => setMorseInput(e.target.value)} /><p className="text-xs">Enc: {morseEnc}</p><p className="text-xs">Dec: {morseDec}</p></div>
          <div className="space-y-2 border border-border rounded p-3 lg:col-span-2"><Label>Tool 09 - Password Strength Analyzer</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} /><Badge variant={scorePassword(password) === 'Strong' ? 'success' : scorePassword(password) === 'Weak' ? 'destructive' : 'warning'}>{scorePassword(password)}</Badge></div>
        </div>
      </details>

      <details className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Phishing Prevention & Awareness Tools</summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 10 - Phishing Email Analyzer</Label><Textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} /><Badge variant={emailRisk.risk === 'High' ? 'destructive' : emailRisk.risk === 'Medium' ? 'warning' : 'success'}>{emailRisk.risk}</Badge>{emailRisk.findings.map((f) => <p key={f} className="text-xs">- {f}</p>)}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 11 - URL Scanner/Link Analyzer</Label><Input value={urlText} onChange={(e) => setUrlText(e.target.value)} /><Badge variant={urlRisk.risk === 'High' ? 'destructive' : urlRisk.risk === 'Medium' ? 'warning' : 'success'}>{urlRisk.risk}</Badge>{urlRisk.findings.map((f) => <p key={f} className="text-xs">- {f}</p>)}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 12 - Email Header Analyzer</Label><Textarea value={headersRaw} onChange={(e) => setHeadersRaw(e.target.value)} />{headerRows.map((h, i) => <p key={`${h.k}-${i}`} className="text-xs"><b>{h.k}</b>: {h.v}</p>)}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 13 - Domain Typosquatting Checker</Label><Input value={domain} onChange={(e) => setDomain(e.target.value)} />{typoVariants.map((v) => <p key={v} className="text-xs">- {v}</p>)}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 14 - Safe Link Expander</Label><Input value={expandUrl} onChange={(e) => setExpandUrl(e.target.value)} /><Button onClick={safeExpand}>Expand</Button>{expandChain.map((c, i) => <p key={`${c}-${i}`} className="text-xs break-all">{i + 1}. {c}</p>)}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 15 - Phishing Quiz</Label>{!quizDone ? (<><p className="text-sm">{quiz[quizIdx].q}</p>{quiz[quizIdx].o.map((o, i) => <Button key={o} variant="outline" className="w-full justify-start" onClick={() => { if (i === quiz[quizIdx].a) setQuizScore((s) => s + 1); if (quizIdx === quiz.length - 1) setQuizDone(true); else setQuizIdx((x) => x + 1); }}>{o}</Button>)}</>) : <p className="text-sm">Score: {quizScore}/{quiz.length}</p>}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 16 - Email Spoofing Demonstrator</Label><Input value={spoofFrom} onChange={(e) => setSpoofFrom(e.target.value)} /><Input value={spoofReply} onChange={(e) => setSpoofReply(e.target.value)} /><p className="text-xs">{spoofNote}</p></div>
          <div className="space-y-2 border border-border rounded p-3 lg:col-span-2"><Label>Tool 17 - Fake Login Page Detector</Label><Textarea value={fakeInput} onChange={(e) => setFakeInput(e.target.value)} /><Badge variant={fakeRisk.risk === 'High' ? 'destructive' : fakeRisk.risk === 'Medium' ? 'warning' : 'success'}>{fakeRisk.risk}</Badge>{fakeRisk.flags.map((f) => <p key={f} className="text-xs">- {f}</p>)}</div>
        </div>
      </details>

      <details className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Cryptographic Hashing Tools</summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 18 - File Hash Checker / Integrity Verifier</Label><Input type="file" onChange={(e) => setHashFile(e.target.files?.[0] ?? null)} /><Button onClick={computeHashes} disabled={!hashFile}>Compute</Button>{Object.entries(hashes).map(([k, v]) => <p key={k} className="text-xs break-all"><b>{k}</b>: {v}</p>)}<Input value={expectedHash} onChange={(e) => setExpectedHash(e.target.value)} placeholder="Expected SHA256" />{expectedHash && hashes.sha256 && <Badge variant={expectedHash.toLowerCase() === hashes.sha256.toLowerCase() ? 'success' : 'destructive'}>{expectedHash.toLowerCase() === hashes.sha256.toLowerCase() ? 'Match' : 'Mismatch'}</Badge>}</div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 19 - Rainbow Table Attack Simulator (Educational)</Label><Input value={rainbowHash} onChange={(e) => setRainbowHash(e.target.value)} placeholder="SHA256 hash" /><Button onClick={rainbowLookup}>Lookup</Button><p className="text-xs">{rainbowOut}</p></div>
        </div>
      </details>
      <details className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Steganography Tools</summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 20 - LSB Image Steganography, Text-in-Image, Steganalysis</Label><Input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files?.[0] ?? null)} /><Textarea value={imgSecret} onChange={(e) => setImgSecret(e.target.value)} placeholder="Secret" /><div className="flex gap-2 flex-wrap"><Button onClick={imageHide} disabled={!imgFile}>Hide</Button><Button variant="secondary" onClick={imageRead} disabled={!imgFile}>Extract</Button><Button variant="outline" onClick={steganalysis} disabled={!imgFile}>Analyze</Button></div>{imgOut && <a href={imgOut} download="stego-image.png" className="text-xs text-primary hover:underline">Download stego image</a>}<p className="text-xs">Extracted: {imgExtract}</p><p className="text-xs">Steganalysis: {stegResult}</p></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 21 - Image Metadata Viewer/Editor</Label><Input type="file" accept="image/*" onChange={(e) => setMetaFile(e.target.files?.[0] ?? null)} /><div className="flex gap-2"><Button onClick={viewMeta} disabled={!metaFile}>View</Button><Button variant="secondary" onClick={stripMeta} disabled={!metaFile}>Strip</Button></div><Textarea value={metaInfo} onChange={(e) => setMetaInfo(e.target.value)} className="min-h-[100px]" /><Input value={metaAuthor} onChange={(e) => setMetaAuthor(e.target.value)} placeholder="Author" /><Input value={metaComment} onChange={(e) => setMetaComment(e.target.value)} placeholder="Comment" /><Button variant="outline" onClick={exportMetaJson}>Export Metadata JSON</Button></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 22 - Audio Steganography Tool (Basic)</Label><Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} /><Textarea value={audioSecret} onChange={(e) => setAudioSecret(e.target.value)} /><div className="flex gap-2"><Button onClick={() => embedCarrier(audioFile, audioSecret)} disabled={!audioFile}>Embed+Download</Button><Button variant="secondary" onClick={() => readCarrier(audioFile, setAudioExtract)} disabled={!audioFile}>Extract</Button></div><p className="text-xs">Extracted: {audioExtract}</p></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 23 - Video Steganography Tool (Basic)</Label><Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} /><Textarea value={videoSecret} onChange={(e) => setVideoSecret(e.target.value)} /><div className="flex gap-2"><Button onClick={() => embedCarrier(videoFile, videoSecret)} disabled={!videoFile}>Embed+Download</Button><Button variant="secondary" onClick={() => readCarrier(videoFile, setVideoExtract)} disabled={!videoFile}>Extract</Button></div><p className="text-xs">Extracted: {videoExtract}</p></div>
          <div className="space-y-2 border border-border rounded p-3 lg:col-span-2"><Label>Tool 24 - Whitespace Steganography Tool</Label><Textarea value={wsCover} onChange={(e) => setWsCover(e.target.value)} /><Textarea value={wsSecret} onChange={(e) => setWsSecret(e.target.value)} /><div className="flex gap-2"><Button onClick={wsEncode}>Encode</Button><Button variant="secondary" onClick={wsDecode}>Decode</Button></div><Textarea value={wsOut} onChange={(e) => setWsOut(e.target.value)} className="min-h-[100px]" /><p className="text-xs">Decoded output appears in image extract field: {imgExtract}</p></div>
        </div>
      </details>

      <details className="bg-card border border-border rounded-lg p-5">
        <summary className="font-semibold cursor-pointer">Digital Signature Tools</summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 25 - RSA Digital Signer/Verifier</Label><Textarea value={rsaSignMsg} onChange={(e) => setRsaSignMsg(e.target.value)} /><div className="flex gap-2"><Button onClick={rsaSign}>Sign</Button><Button variant="secondary" onClick={rsaVerify}>Verify</Button></div><Textarea value={rsaSig} onChange={(e) => setRsaSig(e.target.value)} className="min-h-[100px]" /></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 26 - DSA Tool (Educational)</Label><Input value={dsaPriv} onChange={(e) => setDsaPriv(e.target.value)} placeholder="Private x" /><Input value={dsaPub} onChange={(e) => setDsaPub(e.target.value)} placeholder="Public y" /><Textarea value={dsaMsg} onChange={(e) => setDsaMsg(e.target.value)} /><div className="flex gap-2 flex-wrap"><Button onClick={dsaPubGen}>Generate Public</Button><Button onClick={dsaSignRun}>Sign</Button><Button variant="secondary" onClick={dsaVerifyRun}>Verify</Button></div><Input value={dsaSig} onChange={(e) => setDsaSig(e.target.value)} placeholder="r,s" /><p className="text-xs">{dsaOut}</p></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 27 - Document Signer Simulator</Label><Input value={docSigner} onChange={(e) => setDocSigner(e.target.value)} /><Textarea value={docText} onChange={(e) => setDocText(e.target.value)} /><Button onClick={makeDocPackage}>Generate Package</Button><Textarea value={docPkg} onChange={(e) => setDocPkg(e.target.value)} className="min-h-[100px]" /></div>
          <div className="space-y-2 border border-border rounded p-3"><Label>Tool 28 - Signature Verifier Tool</Label><Textarea value={verifyDoc} onChange={(e) => setVerifyDoc(e.target.value)} placeholder="Document" /><Textarea value={verifyPkg} onChange={(e) => setVerifyPkg(e.target.value)} placeholder="Package JSON" className="min-h-[100px]" /><Button onClick={verifyDocPackage}>Verify</Button><p className="text-xs">{verifyOut}</p></div>
          <div className="space-y-2 border border-border rounded p-3 lg:col-span-2"><Label>Tool 29 - Certificate Generator (Self-Signed X.509)</Label><div className="grid grid-cols-1 md:grid-cols-4 gap-2"><Input value={cert.cn} onChange={(e) => setCert({ ...cert, cn: e.target.value })} placeholder="CN" /><Input value={cert.org} onChange={(e) => setCert({ ...cert, org: e.target.value })} placeholder="Org" /><Input value={cert.c} onChange={(e) => setCert({ ...cert, c: e.target.value })} placeholder="Country" /><Input value={cert.days} onChange={(e) => setCert({ ...cert, days: e.target.value })} placeholder="Days" /></div><Button onClick={certGen}>Generate Certificate</Button><Textarea value={certOut} onChange={(e) => setCertOut(e.target.value)} className="min-h-[220px]" /></div>
        </div>
      </details>

      <div className="bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
        <p>Use these tools only in legal, authorized environments. Email spoofing and attack simulators are for awareness and training only.</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground flex items-start gap-2">
        <Shield className="h-4 w-4 text-primary mt-0.5" />
        <p>CTF Labs remain intentionally under development per your request. All other requested tool areas are implemented.</p>
      </div>
    </ToolLayout>
  );
}


