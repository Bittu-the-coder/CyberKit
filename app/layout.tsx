import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'CyberKit — Cybersecurity Toolkit & Learning Platform',
    template: '%s | CyberKit',
  },
  description:
    'A comprehensive cybersecurity platform with professional security tools, learning courses, CTF labs, and ethical hacking resources.',
  keywords: ['cybersecurity', 'penetration testing', 'ethical hacking', 'security tools', 'CTF'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
