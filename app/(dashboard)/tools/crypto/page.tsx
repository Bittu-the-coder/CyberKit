'use client';

import { useEffect, useMemo, useState } from 'react';
import { Hash, Key, Code, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CryptoTab = 'hash' | 'encode' | 'password' | 'strength' | 'jwt';

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'sha3-256' | 'sha3-512';

interface HashResult {
  input: string;
  hashes?: Record<HashAlgorithm, string>;
  algorithm?: HashAlgorithm;
  hash?: string;
}

interface JwtResult {
  valid: boolean;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature?: string;
  expired?: boolean;
  error?: string;
}

interface PasswordStrengthResult {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'No password provided';
  color: string;
  checks: Array<{ label: string; passed: boolean }>;
}

export default function CryptoPage() {
  const [activeTab, setActiveTab] = useState<CryptoTab>('hash');

  // Hash state
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [hashLoading, setHashLoading] = useState(false);

  // Encode state
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeFormat, setEncodeFormat] = useState('base64');
  const [encodeOp, setEncodeOp] = useState('encode');
  const [encodeOutput, setEncodeOutput] = useState('');

  // Password state
  const [pwLength, setPwLength] = useState(24);
  const [pwOptions, setPwOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [generatedPw, setGeneratedPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // JWT state
  const [jwtInput, setJwtInput] = useState('');
  const [jwtResult, setJwtResult] = useState<JwtResult | null>(null);

  // Password strength state
  const [strengthInput, setStrengthInput] = useState('');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as CryptoTab;
    if (hash && ['hash', 'encode', 'password', 'strength', 'jwt'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  async function handleHash(e: React.FormEvent) {
    e.preventDefault();
    if (!hashInput.trim()) return;
    setHashLoading(true);
    try {
      const res = await fetch('/api/tools/crypto/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: hashInput }),
      });
      const data = await res.json();
      setHashResult(data);
    } catch {
      // ignore
    }
    setHashLoading(false);
  }

  function handleEncode() {
    try {
      if (encodeFormat === 'base64') {
        setEncodeOutput(
          encodeOp === 'encode'
            ? btoa(unescape(encodeURIComponent(encodeInput)))
            : decodeURIComponent(escape(atob(encodeInput)))
        );
      } else if (encodeFormat === 'url') {
        setEncodeOutput(encodeOp === 'encode' ? encodeURIComponent(encodeInput) : decodeURIComponent(encodeInput));
      } else if (encodeFormat === 'hex') {
        if (encodeOp === 'encode') {
          setEncodeOutput(
            Array.from(new TextEncoder().encode(encodeInput))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          );
        } else {
          const bytes = encodeInput.match(/.{1,2}/g) ?? [];
          setEncodeOutput(new TextDecoder().decode(new Uint8Array(bytes.map((b) => parseInt(b, 16)))));
        }
      } else if (encodeFormat === 'html') {
        if (encodeOp === 'encode') {
          setEncodeOutput(
            encodeInput
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
          );
        } else {
          const el = document.createElement('textarea');
          el.innerHTML = encodeInput;
          setEncodeOutput(el.value);
        }
      }
    } catch {
      setEncodeOutput('Error: Invalid input for this operation');
    }
  }

  async function handleGeneratePassword() {
    setPwLoading(true);
    try {
      const res = await fetch('/api/tools/crypto/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: pwLength, ...pwOptions }),
      });
      const data = await res.json();
      setGeneratedPw(data.password ?? '');
    } catch {
      // ignore
    }
    setPwLoading(false);
  }

  function handleJwtAnalyze() {
    if (!jwtInput.trim()) return;
    const parts = jwtInput.trim().split('.');
    if (parts.length !== 3) {
      setJwtResult({ valid: false, error: 'Invalid JWT format: must have 3 parts separated by dots' });
      return;
    }
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expired = payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
      setJwtResult({ valid: true, header, payload, signature: parts[2], expired });
    } catch {
      setJwtResult({ valid: false, error: 'Failed to decode JWT parts' });
    }
  }

  const tabs: Array<{ id: CryptoTab; label: string; icon: React.ReactNode }> = [
    { id: 'hash', label: 'Hash Generator', icon: <Hash className="h-3.5 w-3.5" /> },
    { id: 'encode', label: 'Encoder / Decoder', icon: <Code className="h-3.5 w-3.5" /> },
    { id: 'password', label: 'Password Generator', icon: <Key className="h-3.5 w-3.5" /> },
    { id: 'strength', label: 'Password Strength Analyzer', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: 'jwt', label: 'JWT Analyzer', icon: <Lock className="h-3.5 w-3.5" /> },
  ];

  const ALGORITHMS: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'sha3-512'];

  const strength: PasswordStrengthResult = useMemo(() => {
    const value = strengthInput;
    if (!value) {
      return {
        score: 0,
        label: 'No password provided',
        color: 'bg-muted',
        checks: [],
      };
    }

    const checks = [
      { label: 'At least 12 characters', passed: value.length >= 12 },
      { label: 'Contains uppercase letters', passed: /[A-Z]/.test(value) },
      { label: 'Contains lowercase letters', passed: /[a-z]/.test(value) },
      { label: 'Contains numbers', passed: /[0-9]/.test(value) },
      { label: 'Contains symbols', passed: /[^A-Za-z0-9]/.test(value) },
      { label: 'No repeated 3+ character sequence', passed: !/(.{3,})\1/.test(value) },
      { label: 'No common weak pattern', passed: !/(password|12345|qwerty|admin|letmein)/i.test(value) },
    ];

    let score = checks.reduce((acc, item) => acc + (item.passed ? 1 : 0), 0);
    if (value.length >= 20) score += 1;
    if (value.length < 8) score = Math.max(score - 2, 0);

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', checks };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500', checks };
    if (score <= 6) return { score, label: 'Good', color: 'bg-blue-500', checks };

    return { score, label: 'Strong', color: 'bg-green-500', checks };
  }, [strengthInput]);

  return (
    <ToolLayout
      title="Crypto & Encoding Tools"
      description="Hash generation, encoding/decoding, password generation, strength analysis, and JWT analysis."
      icon={<Hash className="h-5 w-5 text-primary" />}
      category="Cryptography"
    >
      <div className="flex gap-1 p-1 bg-background border border-border rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              window.history.replaceState(null, '', `#${tab.id}`);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hash' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <form onSubmit={handleHash} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="hash-input">Input Text</Label>
                <Textarea
                  id="hash-input"
                  placeholder="Enter text to hash..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="font-mono min-h-[100px]"
                  required
                />
              </div>
              <Button type="submit" disabled={hashLoading}>
                {hashLoading ? 'Computing...' : 'Compute All Hashes'}
              </Button>
            </form>
          </div>

          {hashResult?.hashes && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Hash Results</h3>
              </div>
              <div className="p-5 space-y-3">
                {ALGORITHMS.map((alg) => (
                  <div key={alg} className="space-y-1">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">{alg}</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-background border border-border rounded px-3 py-2 text-cyber-green break-all">
                        {hashResult.hashes![alg]}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(hashResult.hashes![alg])}>
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'encode' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="encode-format">Format</Label>
                <Select id="encode-format" value={encodeFormat} onChange={(e) => setEncodeFormat(e.target.value)}>
                  <option value="base64">Base64</option>
                  <option value="url">URL Encoding</option>
                  <option value="hex">Hex</option>
                  <option value="html">HTML Entities</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="encode-op">Operation</Label>
                <Select id="encode-op" value={encodeOp} onChange={(e) => setEncodeOp(e.target.value)}>
                  <option value="encode">Encode</option>
                  <option value="decode">Decode</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="encode-input">Input</Label>
              <Textarea
                id="encode-input"
                placeholder="Enter input..."
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
                className="font-mono min-h-[100px]"
              />
            </div>
            <Button onClick={handleEncode} disabled={!encodeInput}>
              {encodeOp === 'encode' ? 'Encode' : 'Decode'}
            </Button>
          </div>

          {encodeOutput && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <Label>Output</Label>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(encodeOutput)}>
                  Copy
                </Button>
              </div>
              <code className="block font-mono text-sm bg-background border border-border rounded px-3 py-2 text-cyber-green break-all whitespace-pre-wrap">
                {encodeOutput}
              </code>
            </div>
          )}
        </div>
      )}

      {activeTab === 'password' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw-length">Length: {pwLength}</Label>
              <input
                id="pw-length"
                type="range"
                min={8}
                max={128}
                value={pwLength}
                onChange={(e) => setPwLength(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8</span>
                <span>128</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pwOptions).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setPwOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{key === 'symbols' ? 'Symbols (!@#...)' : key}</span>
                </label>
              ))}
            </div>

            <Button onClick={handleGeneratePassword} disabled={pwLoading}>
              {pwLoading ? 'Generating...' : 'Generate Password'}
            </Button>
          </div>

          {generatedPw && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <Label>Generated Password</Label>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(generatedPw)}>
                  Copy
                </Button>
              </div>
              <code className="block font-mono text-lg bg-background border border-border rounded px-3 py-3 text-cyber-green break-all">
                {generatedPw}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Length: {generatedPw.length} characters. Store this in a password manager.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'strength' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="strength-input">Password to Analyze</Label>
              <Input
                id="strength-input"
                type="text"
                placeholder="Enter or paste password..."
                value={strengthInput}
                onChange={(e) => setStrengthInput(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Analysis runs locally in your browser. Nothing is sent to the server.
              </p>
            </div>
          </div>

          {strengthInput && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Strength Rating</Label>
                  <Badge variant={strength.label === 'Strong' ? 'success' : strength.label === 'Weak' ? 'destructive' : 'warning'}>
                    {strength.label}
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${Math.min((strength.score / 8) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strength.checks.map((check) => (
                  <div
                    key={check.label}
                    className={`text-sm px-3 py-2 rounded border ${
                      check.passed
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {check.passed ? 'Pass' : 'Fail'} - {check.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jwt' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="jwt-input">JWT Token</Label>
              <Textarea
                id="jwt-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                className="font-mono min-h-[100px] text-xs"
              />
            </div>
            <Button onClick={handleJwtAnalyze} disabled={!jwtInput.trim()}>
              Analyze JWT
            </Button>
          </div>

          {jwtResult && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">JWT Analysis</h3>
                {jwtResult.valid ? (
                  jwtResult.expired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="success">Valid Format</Badge>
                  )
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
              </div>

              {jwtResult.error ? (
                <div className="p-5 text-sm text-destructive">{jwtResult.error}</div>
              ) : (
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Header</h4>
                    <pre className="font-mono text-xs bg-background border border-border rounded p-3 text-cyber-blue overflow-x-auto">
                      {JSON.stringify(jwtResult.header, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Payload</h4>
                    <pre className="font-mono text-xs bg-background border border-border rounded p-3 text-cyber-green overflow-x-auto">
                      {JSON.stringify(jwtResult.payload, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Signature</h4>
                    <code className="font-mono text-xs bg-background border border-border rounded px-3 py-2 text-muted-foreground break-all block">
                      {jwtResult.signature}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    Note: CyberKit only decodes JWT. It does not verify signatures. Use proper JWT libraries with your secret key to verify token integrity.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
