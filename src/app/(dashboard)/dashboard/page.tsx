'use client';

import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const displayName =
    user?.profile?.firstName || user?.profile?.lastName
      ? [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ')
      : (user?.email ?? 'Guest');

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user ? `, ${displayName}` : ''}. Here&apos;s what&apos;s happening.
        </p>
      </header>

      <div className="mb-8 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">User info</h2>
        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Provider</dt>
            <dd className="font-medium">{user?.provider ?? 'local'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
