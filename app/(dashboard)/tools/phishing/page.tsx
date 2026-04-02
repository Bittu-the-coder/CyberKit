'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Link as LinkIcon, Mail, ShieldCheck } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PhishingTab = 'url' | 'email';

interface Signal {
  label: string;
  risk: 'low' | 'medium' | 'high';
}

function getDomain(urlValue: string) {
  try {
    const url = new URL(urlValue.startsWith('http') ? urlValue : `https://${urlValue}`);
    return url.hostname.toLowerCase();
  } catch {
    return '';
  }
}

function analyzeUrl(urlValue: string) {
  const raw = urlValue.trim();
  const signals: Signal[] = [];

  if (!raw) return { score: 0, label: 'No URL provided', signals };

  const domain = getDomain(raw);
  if (!domain) {
    signals.push({ label: 'Invalid URL format', risk: 'high' });
    return { score: 80, label: 'High Risk', signals };
  }

  const normalized = raw.toLowerCase();

  if (!normalized.startsWith('https://')) {
    signals.push({ label: 'Not using HTTPS', risk: 'medium' });
  }

  if ((domain.match(/\./g) || []).length > 3) {
    signals.push({ label: 'Unusually deep subdomain structure', risk: 'medium' });
  }

  if (/[0-9]{2,}/.test(domain)) {
    signals.push({ label: 'Domain contains many digits', risk: 'medium' });
  }

  if (domain.includes('xn--')) {
    signals.push({ label: 'Punycode domain detected (possible lookalike)', risk: 'high' });
  }

  if (/login|verify|secure|update|wallet|banking|signin/.test(normalized) && /free|bonus|gift|urgent/.test(normalized)) {
    signals.push({ label: 'Social engineering language in URL path', risk: 'high' });
  }

  if (normalized.length > 120) {
    signals.push({ label: 'Very long URL', risk: 'medium' });
  }

  if (/bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd/.test(domain)) {
    signals.push({ label: 'Shortened link detected', risk: 'medium' });
  }

  const high = signals.filter((s) => s.risk === 'high').length;
  const medium = signals.filter((s) => s.risk === 'medium').length;
  const score = Math.min(high * 35 + medium * 15, 100);

  if (score >= 70) return { score, label: 'High Risk', signals };
  if (score >= 35) return { score, label: 'Medium Risk', signals };
  return { score, label: 'Low Risk', signals };
}

function analyzeEmail(emailText: string) {
  const text = emailText.trim();
  const signals: Signal[] = [];

  if (!text) return { score: 0, label: 'No email content provided', signals };

  const lowered = text.toLowerCase();

  if (/urgent|immediately|action required|final warning|suspended/.test(lowered)) {
    signals.push({ label: 'Urgency or pressure wording detected', risk: 'high' });
  }

  if (/gift card|wire transfer|crypto|bitcoin|payment now/.test(lowered)) {
    signals.push({ label: 'Financial request pattern detected', risk: 'high' });
  }

  if (/click here|verify your account|reset your password|confirm identity/.test(lowered)) {
    signals.push({ label: 'Credential-harvesting phrasing detected', risk: 'high' });
  }

  if (/dear customer|dear user|valued member/.test(lowered)) {
    signals.push({ label: 'Generic greeting used', risk: 'medium' });
  }

  if ((text.match(/https?:\/\//g) || []).length > 2) {
    signals.push({ label: 'Multiple links included', risk: 'medium' });
  }

  if (/\.zip|\.exe|\.scr|\.js|\.html/.test(lowered) && /attachment|invoice|document/.test(lowered)) {
    signals.push({ label: 'Potentially dangerous attachment indicator', risk: 'high' });
  }

  if (/password|otp|2fa code|security code/.test(lowered) && /send|share|reply/.test(lowered)) {
    signals.push({ label: 'Asks for sensitive secrets', risk: 'high' });
  }

  const high = signals.filter((s) => s.risk === 'high').length;
  const medium = signals.filter((s) => s.risk === 'medium').length;
  const score = Math.min(high * 30 + medium * 15, 100);

  if (score >= 70) return { score, label: 'High Risk', signals };
  if (score >= 35) return { score, label: 'Medium Risk', signals };
  return { score, label: 'Low Risk', signals };
}

export default function PhishingToolsPage() {
  const [activeTab, setActiveTab] = useState<PhishingTab>('url');
  const [urlInput, setUrlInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [urlSubmitted, setUrlSubmitted] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const urlAnalysis = useMemo(() => analyzeUrl(urlInput), [urlInput]);
  const emailAnalysis = useMemo(() => analyzeEmail(emailInput), [emailInput]);

  const riskBadgeVariant = (label: string) => {
    if (label === 'High Risk') return 'destructive';
    if (label === 'Medium Risk') return 'warning';
    return 'success';
  };

  return (
    <ToolLayout
      title="Phishing Site and Email Detector"
      description="Analyze suspicious links and email content for common phishing red flags."
      icon={<AlertTriangle className="h-5 w-5 text-primary" />}
      category="Phishing Prevention"
    >
      <div className="flex gap-1 p-1 bg-background border border-border rounded-lg w-fit">
        {[{ id: 'url', label: 'URL Scanner', icon: <LinkIcon className="h-3.5 w-3.5" /> }, { id: 'email', label: 'Email Analyzer', icon: <Mail className="h-3.5 w-3.5" /> }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as PhishingTab)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="url-input">Suspicious URL</Label>
              <Input
                id="url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/login"
                className="font-mono"
              />
            </div>
            <Button onClick={() => setUrlSubmitted(true)} disabled={!urlInput.trim()}>
              Analyze URL
            </Button>
          </div>

          {urlSubmitted && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Risk Assessment</Label>
                <Badge variant={riskBadgeVariant(urlAnalysis.label)}>{urlAnalysis.label}</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    urlAnalysis.label === 'High Risk'
                      ? 'bg-red-500'
                      : urlAnalysis.label === 'Medium Risk'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  )}
                  style={{ width: `${urlAnalysis.score}%` }}
                />
              </div>
              <div className="space-y-2">
                {urlAnalysis.signals.length > 0 ? (
                  urlAnalysis.signals.map((signal) => (
                    <div key={signal.label} className="text-sm px-3 py-2 rounded border border-border bg-background text-muted-foreground">
                      {signal.risk.toUpperCase()} - {signal.label}
                    </div>
                  ))
                ) : (
                  <div className="text-sm px-3 py-2 rounded border border-green-500/30 bg-green-500/10 text-green-400">
                    No major phishing indicators were detected from pattern checks.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-input">Email Content</Label>
              <Textarea
                id="email-input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Paste full suspicious email here..."
                className="min-h-[180px]"
              />
            </div>
            <Button onClick={() => setEmailSubmitted(true)} disabled={!emailInput.trim()}>
              Analyze Email
            </Button>
          </div>

          {emailSubmitted && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Risk Assessment</Label>
                <Badge variant={riskBadgeVariant(emailAnalysis.label)}>{emailAnalysis.label}</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    emailAnalysis.label === 'High Risk'
                      ? 'bg-red-500'
                      : emailAnalysis.label === 'Medium Risk'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  )}
                  style={{ width: `${emailAnalysis.score}%` }}
                />
              </div>
              <div className="space-y-2">
                {emailAnalysis.signals.length > 0 ? (
                  emailAnalysis.signals.map((signal) => (
                    <div key={signal.label} className="text-sm px-3 py-2 rounded border border-border bg-background text-muted-foreground">
                      {signal.risk.toUpperCase()} - {signal.label}
                    </div>
                  ))
                ) : (
                  <div className="text-sm px-3 py-2 rounded border border-green-500/30 bg-green-500/10 text-green-400">
                    No major phishing indicators were detected from pattern checks.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
        <p>
          This is an educational detector that uses heuristic checks. For production-grade protection, combine it with mail gateway filtering, domain reputation checks, and user training.
        </p>
      </div>
    </ToolLayout>
  );
}
