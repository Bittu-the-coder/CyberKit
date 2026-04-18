'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Key, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'api' | 'security' | 'notifications';

const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(session?.user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { displayName } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">Update your personal information.</p>
              </div>
              <Separator />
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email-display">Email</Label>
                  <Input
                    id="email-display"
                    value={session?.user?.email ?? ''}
                    disabled
                    className="opacity-60"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed after registration.</p>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">API Keys</h2>
                <p className="text-sm text-muted-foreground">
                  Configure third-party API keys for enhanced tool functionality.
                </p>
              </div>
              <Separator />
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="hibp-key">HaveIBeenPwned API Key</Label>
                  <Input id="hibp-key" type="password" placeholder="••••••••••••••••••••" />
                  <p className="text-xs text-muted-foreground">
                    Required for the Data Breach Check tool.{' '}
                    <a href="https://haveibeenpwned.com/API/Key" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Get a key →
                    </a>
                  </p>
                </div>
                <Button>Save API Keys</Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">Manage your account security settings.</p>
              </div>
              <Separator />
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                <Button>Update Password</Button>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">Danger Zone</h3>
                  <Button variant="destructive" type="button">Delete Account</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Manage your notification preferences.</p>
              </div>
              <Separator />
              <div className="space-y-3 max-w-md">
                {[
                  { label: 'Scan completed', description: 'Get notified when a scan finishes' },
                  { label: 'Security advisories', description: 'Platform security announcements' },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    <input type="checkbox" className="ml-4" />
                  </label>
                ))}
                <Button>Save Preferences</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
