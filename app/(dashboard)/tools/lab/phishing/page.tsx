'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function normalizeUrl(v: string) {
  try {
    return new URL(v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`);
  } catch { return null; }
}

const quiz = [
  { q: 'Strong phishing red flag?', o: ['Urgent + suspicious link', 'Morning send time', 'Long email'], a: 0 },
  { q: 'Suspicious login email best response?', o: ['Click included link', 'Open known official site manually', 'Reply with OTP'], a: 1 },
  { q: 'Display name trusted, domain misspelled means?', o: ['Safe', 'Typosquatting', 'Newsletter'], a: 1 },
];

export default function LabPhishingPage() {
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
    return fd !== rd
      ? `Potential spoofing: From (${fd}) differs from Reply-To (${rd})`
      : 'No domain mismatch between From and Reply-To';
  }, [spoofFrom, spoofReply]);

  const fakeRisk = useMemo(() => {
    const t = fakeInput.toLowerCase();
    const flags: string[] = [];
    if (/http:/.test(t) && /password/.test(t)) flags.push('Password form over HTTP');
    if (/display:\s*none/.test(t) && /iframe/.test(t)) flags.push('Hidden iframe');
    if (/verify account|urgent action/.test(t)) flags.push('Social engineering text');
    return { risk: flags.length > 1 ? 'High' : flags.length ? 'Medium' : 'Low', flags: flags.length ? flags : ['No major indicators'] };
  }, [fakeInput]);

  async function safeExpand() {
    const r = await fetch('/api/tools/phishing/expand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: expandUrl }) });
    const d = await r.json();
    setExpandChain(d.chain ?? [d.error ?? 'Failed']);
  }

  function riskVariant(risk: string): 'destructive' | 'warning' | 'success' {
    if (risk === 'High') return 'destructive';
    if (risk === 'Medium') return 'warning';
    return 'success';
  }

  return (
    <ToolLayout
      title="Phishing Awareness Tools"
      description="Email analyzer, URL scanner, header inspector, typosquatting checker, link expander, phishing quiz, spoofing demo, and fake login detector."
      icon={<AlertTriangle className="h-5 w-5 text-primary" />}
      category="Tool Lab"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 10 */}
        <Section title="Tool 10 — Phishing Email Analyzer">
          <Label>Email body</Label>
          <Textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} rows={4} placeholder="Paste suspicious email body…" />
          <Badge variant={riskVariant(emailRisk.risk)}>{emailRisk.risk} Risk</Badge>
          <ul className="text-xs space-y-0.5 text-muted-foreground">
            {emailRisk.findings.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </Section>

        {/* Tool 11 */}
        <Section title="Tool 11 — URL Scanner / Link Analyzer">
          <Label>URL</Label>
          <Input value={urlText} onChange={(e) => setUrlText(e.target.value)} placeholder="https://example.com/path" />
          <Badge variant={riskVariant(urlRisk.risk)}>{urlRisk.risk} Risk</Badge>
          <ul className="text-xs space-y-0.5 text-muted-foreground">
            {urlRisk.findings.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </Section>

        {/* Tool 12 */}
        <Section title="Tool 12 — Email Header Analyzer">
          <Label>Raw headers</Label>
          <Textarea value={headersRaw} onChange={(e) => setHeadersRaw(e.target.value)} rows={5} placeholder="Paste raw email headers…" />
          {headerRows.length > 0 && (
            <div className="divide-y divide-border rounded border border-border overflow-hidden">
              {headerRows.map((h, i) => (
                <div key={`${h.k}-${i}`} className="flex gap-2 px-2 py-1 text-xs">
                  <span className="w-36 flex-shrink-0 font-medium text-foreground">{h.k}</span>
                  <span className="text-muted-foreground break-all">{h.v}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Tool 13 */}
        <Section title="Tool 13 — Domain Typosquatting Checker">
          <Label>Domain (e.g. example.com)</Label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          {typoVariants.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {typoVariants.map((v) => (
                <span key={v} className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{v}</span>
              ))}
            </div>
          )}
        </Section>

        {/* Tool 14 */}
        <Section title="Tool 14 — Safe Link Expander">
          <Label>Short URL</Label>
          <Input value={expandUrl} onChange={(e) => setExpandUrl(e.target.value)} placeholder="https://bit.ly/…" />
          <Button onClick={safeExpand} disabled={!expandUrl}>Expand</Button>
          {expandChain.length > 0 && (
            <ol className="text-xs space-y-0.5 text-muted-foreground list-decimal list-inside">
              {expandChain.map((c, i) => <li key={`${c}-${i}`} className="break-all">{c}</li>)}
            </ol>
          )}
        </Section>

        {/* Tool 15 */}
        <Section title="Tool 15 — Phishing Awareness Quiz">
          {!quizDone ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Q{quizIdx + 1}/{quiz.length}: {quiz[quizIdx].q}</p>
              <div className="space-y-2">
                {quiz[quizIdx].o.map((o, i) => (
                  <Button
                    key={o}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      if (i === quiz[quizIdx].a) setQuizScore((s) => s + 1);
                      if (quizIdx === quiz.length - 1) setQuizDone(true);
                      else setQuizIdx((x) => x + 1);
                    }}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">Score: <strong>{quizScore}/{quiz.length}</strong></p>
              <Button variant="secondary" onClick={() => { setQuizDone(false); setQuizIdx(0); setQuizScore(0); }}>Restart</Button>
            </div>
          )}
        </Section>

        {/* Tool 16 */}
        <Section title="Tool 16 — Email Spoofing Demonstrator">
          <Label>From</Label>
          <Input value={spoofFrom} onChange={(e) => setSpoofFrom(e.target.value)} />
          <Label>Reply-To</Label>
          <Input value={spoofReply} onChange={(e) => setSpoofReply(e.target.value)} />
          <p className={`text-xs font-medium ${spoofFrom.split('@')[1] !== spoofReply.split('@')[1] ? 'text-destructive' : 'text-cyber-green'}`}>
            {spoofNote}
          </p>
        </Section>

        {/* Tool 17 */}
        <Section title="Tool 17 — Fake Login Page Detector">
          <Label>Paste suspicious HTML or text</Label>
          <Textarea value={fakeInput} onChange={(e) => setFakeInput(e.target.value)} rows={4} placeholder="Paste page source or description…" />
          <Badge variant={riskVariant(fakeRisk.risk)}>{fakeRisk.risk} Risk</Badge>
          <ul className="text-xs space-y-0.5 text-muted-foreground">
            {fakeRisk.flags.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </Section>
      </div>
    </ToolLayout>
  );
}
