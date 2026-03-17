'use client';

import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      {title && (
        <h1 className="text-sm font-semibold text-foreground flex-1">{title}</h1>
      )}
      {!title && <div className="flex-1" />}

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        {session?.user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm"
            >
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-medium max-w-24 truncate">
                {session.user.name ?? session.user.email}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-card shadow-lg py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Settings className="h-3 w-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
