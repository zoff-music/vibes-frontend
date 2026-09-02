import type { AdminUser } from '@vibes/models';
import { showRateLimitMessageToast } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import { type ChangeEvent, useEffect, useState } from 'react';
import {
  NavLink,
  type NavLinkRenderProps,
  Outlet,
  type ShouldRevalidateFunctionArgs,
  useFetcher,
  useLoaderData,
} from 'react-router';
import { AdminErrorView } from '../../components/AdminErrorView';
import type { AdminActionData } from './action';
import { action } from './action';
import type { AdminLoaderData } from './loader';
import { loader } from './loader';

export { action, loader };

export interface AdminOutletContext {
  user: AdminUser;
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  if (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    ('completedIntent' in actionResult ||
      'error' in actionResult ||
      'message' in actionResult ||
      'rooms' in actionResult ||
      'success' in actionResult)
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}

export default function AdminLayout() {
  const { session } = useLoaderData<AdminLoaderData>();
  const fetcher = useFetcher<AdminActionData>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.rateLimitMessage) {
      showRateLimitMessageToast(fetcher.data.rateLimitMessage);
    }
  }, [fetcher.data]);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  if (!session.authorized || !session.user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-theme px-6 py-12 text-theme">
        <div className="relative z-10 w-full max-w-md">
          <div className="panel-strong rounded-3xl border border-theme-strong p-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 font-black text-3xl tracking-tight">
                Admin Access
              </h1>
              <p className="text-sm text-theme-muted">
                Sign in with your admin account.
              </p>
            </div>

            <fetcher.Form className="space-y-4" method="post">
              <input name="intent" type="hidden" value="login" />
              <label className="block">
                <span className="mb-2 block font-semibold text-theme-muted text-xs uppercase tracking-widest">
                  Username
                </span>
                <input
                  autoComplete="username"
                  className="w-full rounded-xl border-2 border-theme bg-theme-surface px-4 py-3 font-mono text-base text-theme transition-all placeholder:text-theme-subtle focus:border-primary focus:shadow-focus-primary focus:outline-hidden"
                  disabled={isSubmitting}
                  maxLength={64}
                  minLength={3}
                  name="username"
                  onChange={handleUsernameChange}
                  placeholder="Username"
                  required
                  type="text"
                  value={username}
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold text-theme-muted text-xs uppercase tracking-widest">
                  Password
                </span>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-theme bg-theme-surface px-4 py-3 font-mono text-base text-theme transition-all placeholder:text-theme-subtle focus:border-primary focus:shadow-focus-primary focus:outline-hidden"
                  disabled={isSubmitting}
                  maxLength={128}
                  minLength={16}
                  name="password"
                  onChange={handlePasswordChange}
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                />
              </label>

              {fetcher.data?.error && (
                <p
                  aria-live="polite"
                  className="text-red-500 text-sm"
                  role="alert"
                >
                  {fetcher.data.error}
                </p>
              )}

              <Button
                className="w-full"
                disabled={!username || !password || isSubmitting}
                type="submit"
                variant="primary"
              >
                {isSubmitting ? 'Signing in...' : 'Enter Dashboard'}
              </Button>
            </fetcher.Form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme px-4 py-8 text-theme sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="panel-strong rounded-2xl border border-theme-strong p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-theme-subtle text-xs uppercase tracking-widest">
                Zoff administration
              </p>
              <p className="font-black text-2xl tracking-tight">
                {session.user.username}
              </p>
            </div>

            <fetcher.Form method="post">
              <input name="intent" type="hidden" value="logout" />
              <Button disabled={isSubmitting} type="submit" variant="secondary">
                Sign Out
              </Button>
            </fetcher.Form>
          </div>

          <nav
            aria-label="Admin navigation"
            className="mt-4 flex flex-wrap gap-2 border-theme border-t pt-4"
          >
            <NavLink className={getNavigationClassName} end to="/admin">
              Overview
            </NavLink>
            <NavLink className={getNavigationClassName} to="/admin/rooms">
              Rooms
            </NavLink>
            <NavLink className={getNavigationClassName} to="/admin/users">
              Admin Users
            </NavLink>
          </nav>
        </header>

        <Outlet context={{ user: session.user }} />
      </div>
    </div>
  );
}

function getNavigationClassName({ isActive }: NavLinkRenderProps) {
  if (isActive) {
    return 'cursor-pointer rounded-xl bg-primary px-4 py-2 font-bold text-sm text-text-inverse';
  }

  return 'cursor-pointer rounded-xl border border-theme bg-theme-surface px-4 py-2 font-bold text-sm text-theme-muted transition-colors hover:border-theme-strong hover:text-theme';
}

export function ErrorBoundary() {
  return (
    <AdminErrorView
      message="The requested admin data could not be loaded. Reload the page to try again."
      title="Admin request failed"
    />
  );
}
