import Link from 'next/link';
import {
  Globe,
  Network,
  Lock,
  Search,
  Hash,
  Bug,
  Shield,
  BookOpen,
  Activity,
  ArrowRight,
  Database,
  Wifi,
  Key,
} from 'lucide-react';

const toolCategories = [
  {
    title: 'Reconnaissance',
    description: 'Passive and active information gathering',
    icon: <Globe className="h-5 w-5 text-blue-400" />,
    color: 'border-blue-500/20 hover:border-blue-500/40',
    tools: [
      { name: 'WHOIS Lookup', href: '/tools/recon/whois' },
      { name: 'DNS Enumeration', href: '/tools/recon/dns' },
      { name: 'Subdomain Enum', href: '/tools/recon/subdomain' },
    ],
  },
  {
    title: 'Web Pentesting',
    description: 'Web application security analysis',
    icon: <Bug className="h-5 w-5 text-orange-400" />,
    color: 'border-orange-500/20 hover:border-orange-500/40',
    tools: [
      { name: 'HTTP Headers', href: '/tools/web/headers' },
      { name: 'SSL Inspector', href: '/tools/web/ssl' },
      { name: 'CORS Checker', href: '/tools/web/cors' },
    ],
  },
  {
    title: 'Network',
    description: 'Network scanning and analysis',
    icon: <Network className="h-5 w-5 text-green-400" />,
    color: 'border-green-500/20 hover:border-green-500/40',
    tools: [
      { name: 'Port Scanner', href: '/tools/network/portscan' },
    ],
  },
  {
    title: 'Crypto & Encoding',
    description: 'Hashing, encoding and crypto tools',
    icon: <Hash className="h-5 w-5 text-purple-400" />,
    color: 'border-purple-500/20 hover:border-purple-500/40',
    tools: [
      { name: 'Hash Generator', href: '/tools/crypto' },
      { name: 'Encoder/Decoder', href: '/tools/crypto#encode' },
      { name: 'JWT Analyzer', href: '/tools/crypto#jwt' },
      { name: 'Password Generator', href: '/tools/crypto#password' },
    ],
  },
  {
    title: 'OSINT',
    description: 'Open source intelligence gathering',
    icon: <Search className="h-5 w-5 text-yellow-400" />,
    color: 'border-yellow-500/20 hover:border-yellow-500/40',
    tools: [
      { name: 'Username Search', href: '/tools/osint/username' },
      { name: 'Breach Check', href: '/tools/osint/breach' },
    ],
  },
  {
    title: 'CVE Research',
    description: 'Vulnerability database and CVE lookup',
    icon: <Shield className="h-5 w-5 text-red-400" />,
    color: 'border-red-500/20 hover:border-red-500/40',
    tools: [
      { name: 'CVE Search', href: '/tools/cve' },
    ],
  },
];

const stats = [
  { label: 'Tools Available', value: '15+', icon: <Activity className="h-4 w-4" /> },
  { label: 'Courses', value: '10+', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'CTF Labs', value: '5+', icon: <Key className="h-4 w-4" /> },
  { label: 'CVEs Indexed', value: '200K+', icon: <Database className="h-4 w-4" /> },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome to CyberKit — your professional cybersecurity toolkit.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-md">
          <span className="status-dot status-dot-online" />
          All tools operational
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {stat.icon}
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tool categories */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Security Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCategories.map((category) => (
            <div
              key={category.title}
              className={`bg-card border rounded-lg p-5 transition-colors ${category.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {category.tools.map((tool) => (
                  <li key={tool.name}>
                    <Link
                      href={tool.href}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md text-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground group"
                    >
                      <span>{tool.name}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/learning/courses"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Learning Platform</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Structured courses, CTF labs, and learning roadmaps for all skill levels.
          </p>
          <div className="flex items-center gap-1 text-xs text-primary">
            Browse courses <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/reports"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Scan History</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            View and manage your saved scan results, generate professional reports.
          </p>
          <div className="flex items-center gap-1 text-xs text-primary">
            View reports <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
