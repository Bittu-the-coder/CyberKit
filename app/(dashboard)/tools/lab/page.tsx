import { ToolLayout } from '@/components/tools/ToolLayout';
import {
  Beaker,
  Hash,
  Key,
  Lock,
  Shield,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    title: 'Cryptography',
    description: 'Classical & modern ciphers: Caesar, Vigenere, Rail Fence, Playfair, DES/3DES, RSA, Diffie-Hellman, Morse, Password Strength.',
    href: '/tools/lab/crypto',
    icon: Key,
    tools: 9,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    title: 'Phishing Awareness',
    description: 'Email analyzer, URL scanner, header inspector, typosquatting checker, link expander, phishing quiz, spoofing demo, fake login detector.',
    href: '/tools/lab/phishing',
    icon: AlertTriangle,
    tools: 8,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    title: 'Hashing',
    description: 'Compute MD5/SHA-1/SHA-256/SHA-512 file hashes, integrity verification, and rainbow table attack simulator.',
    href: '/tools/lab/hashing',
    icon: Hash,
    tools: 2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Steganography',
    description: 'LSB image steganography, image metadata viewer/editor, audio/video carrier embedding, whitespace steganography.',
    href: '/tools/lab/steganography',
    icon: Lock,
    tools: 5,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
  {
    title: 'Digital Signatures',
    description: 'RSA digital signer/verifier, DSA educational tool, document signer simulator, signature verifier, X.509 certificate generator.',
    href: '/tools/lab/signatures',
    icon: Shield,
    tools: 5,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
  },
];

export default function ToolLabIndexPage() {
  return (
    <ToolLayout
      title="Tool Lab"
      description="Hands-on security tools covering cryptography, phishing, hashing, steganography, and digital signatures."
      icon={<Beaker className="h-5 w-5 text-primary" />}
      category="Toolkit"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex flex-col gap-3 rounded-lg border p-5 transition-shadow hover:shadow-md ${s.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-semibold text-sm ${s.color}`}>
                  <Icon className="h-4 w-4" />
                  {s.title}
                </div>
                <span className="text-xs text-muted-foreground font-mono">{s.tools} tools</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              <div className={`flex items-center gap-1 text-xs font-medium mt-auto ${s.color}`}>
                Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-2 mt-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p>Use these tools only in legal, authorized environments. Simulators are for awareness and education only.</p>
      </div>
    </ToolLayout>
  );
}
