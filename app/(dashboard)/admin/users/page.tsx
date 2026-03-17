'use client';

import { useToast } from '@/hooks/use-toast';
import { Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'pro' | 'admin';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not load users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Update failed');

      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
      toast({ title: 'Success', description: 'User role updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not update role.', variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setUsers(users.filter(u => u._id !== userId));
      toast({ title: 'Success', description: 'User deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete user.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">User Management</h1>
        <p className="text-muted-foreground text-sm">View and manage platform users and roles.</p>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-accent/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.username}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      className="bg-transparent border border-border rounded px-2 py-1 text-xs outline-none focus:border-primary"
                    >
                      <option value="user" className="bg-background">User</option>
                      <option value="pro" className="bg-background">Pro</option>
                      <option value="admin" className="bg-background">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors inline-block"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
