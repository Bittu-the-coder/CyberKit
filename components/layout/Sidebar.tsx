'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Shield,
  Globe,
  Network,
  Lock,
  Search,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
  Bug,
  Key,
  Hash,
  User,
  Wifi,
  Database,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    label: 'Recon',
    icon: <Globe className="h-4 w-4" />,
    children: [
      { label: 'WHOIS Lookup', href: '/tools/recon/whois', icon: <Database className="h-3 w-3" /> },
      { label: 'DNS Enumeration', href: '/tools/recon/dns', icon: <Network className="h-3 w-3" /> },
      { label: 'Subdomain Enum', href: '/tools/recon/subdomain', icon: <Globe className="h-3 w-3" /> },
    ],
  },
  {
    label: 'Web Pentesting',
    icon: <Bug className="h-4 w-4" />,
    children: [
      { label: 'HTTP Headers', href: '/tools/web/headers', icon: <Activity className="h-3 w-3" /> },
      { label: 'SSL Inspector', href: '/tools/web/ssl', icon: <Lock className="h-3 w-3" /> },
      { label: 'CORS Checker', href: '/tools/web/cors', icon: <Wifi className="h-3 w-3" /> },
    ],
  },
  {
    label: 'Network',
    icon: <Network className="h-4 w-4" />,
    children: [
      { label: 'Port Scanner', href: '/tools/network/portscan', icon: <Wifi className="h-3 w-3" /> },
    ],
  },
  {
    label: 'Crypto & Encoding',
    icon: <Hash className="h-4 w-4" />,
    href: '/tools/crypto',
  },
  {
    label: 'OSINT',
    icon: <Search className="h-4 w-4" />,
    children: [
      { label: 'Username Search', href: '/tools/osint/username', icon: <User className="h-3 w-3" /> },
      { label: 'Breach Check', href: '/tools/osint/breach', icon: <Shield className="h-3 w-3" /> },
    ],
  },
  {
    label: 'CVE Research',
    href: '/tools/cve',
    icon: <Bug className="h-4 w-4" />,
    badge: 'NVD',
  },
  {
    label: 'Learning',
    icon: <BookOpen className="h-4 w-4" />,
    children: [
      { label: 'Courses', href: '/learning/courses', icon: <BookOpen className="h-3 w-3" /> },
      { label: 'CTF Labs', href: '/learning/labs', icon: <Key className="h-3 w-3" /> },
      { label: 'Roadmaps', href: '/learning/roadmaps', icon: <Activity className="h-3 w-3" /> },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some((child) => child.href && pathname.startsWith(child.href));
  });

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            expanded ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        {expanded && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
            {item.children.map((child) => (
              <NavLink key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="h-7 w-7 rounded bg-primary/20 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold text-sm tracking-wide">
          Cyber<span className="text-primary">Kit</span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">v1.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="status-dot status-dot-online" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
