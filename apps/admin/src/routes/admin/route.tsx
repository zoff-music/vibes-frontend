import { showRateLimitMessageToast } from '@vibes/api';
import type { AdminUser } from '@vibes/models';
import { Button } from '@vibes/ui';
import { type ChangeEvent, useEffect, useState } from 'react';
import {
  isRouteErrorResponse,
  NavLink,
  type NavLinkRenderProps,
  Outlet,
  useFetcher,
  useLoaderData,
  useRouteError,
} from 'react-router';
import type { AdminActionData } from './action';
import { action } from './action';
import type { AdminLoaderData } from './loader';
import { loader } from './loader';

export { action, loader };

export interface AdminOutletContext {
  user: AdminUser;
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12 text-ink dark:bg-gray-900 dark:text-white">
        <div className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl border-2 border-ink/10 p-8 dark:border-gray-700">
            <div className="mb-6 text-center">
              <h1 className="mb-2 font-black text-3xl tracking-tight">
                Admin Access
              </h1>
              <p className="text-ink/60 text-sm dark:text-gray-400">
                Sign in with your admin account.
              </p>
            </div>

            <fetcher.Form className="space-y-4" method="post">
              <input name="intent" type="hidden" value="login" />
              <label className="block">
                <span className="mb-2 block font-semibold text-ink/80 text-xs uppercase tracking-widest dark:text-gray-400">
                  Username
                </span>
                <input
                  autoComplete="username"
                  className="w-full rounded-xl border-2 border-ink/20 bg-surface px-4 py-3 font-mono text-base text-ink transition-all placeholder:text-ink/40 focus:border-primary focus:shadow-focus-primary focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
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
                <span className="mb-2 block font-semibold text-ink/80 text-xs uppercase tracking-widest dark:text-gray-400">
                  Password
                </span>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-ink/20 bg-surface px-4 py-3 font-mono text-base text-ink transition-all placeholder:text-ink/40 focus:border-primary focus:shadow-focus-primary focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
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
                <p className="text-red-500 text-sm">{fetcher.data.error}</p>
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
    <div className="min-h-screen overflow-x-hidden bg-surface px-4 py-8 text-ink sm:px-6 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="glass rounded-2xl border-2 border-ink/10 p-4 dark:border-gray-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-ink/50 text-xs uppercase tracking-widest dark:text-gray-500">
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
            className="mt-4 flex flex-wrap gap-2 border-ink/10 border-t pt-4 dark:border-gray-700"
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
    return 'cursor-pointer rounded-xl bg-primary px-4 py-2 font-bold text-sm text-white';
  }

  return 'cursor-pointer rounded-xl bg-ink/5 px-4 py-2 font-bold text-ink/60 text-sm transition-colors hover:bg-ink/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700';
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Could not load the admin dashboard.';
  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12 text-ink dark:bg-gray-900 dark:text-white">
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl border-2 border-ink/10 p-8 text-center dark:border-gray-700">
          <h1 className="mb-2 font-black text-3xl tracking-tight">
            Admin Error
          </h1>
          <p className="mb-6 text-ink/60 text-sm dark:text-gray-400">
            {message}
          </p>
          <Button className="w-full" onClick={reloadPage} variant="primary">
            Reload
          </Button>
        </div>
      </div>
    </main>
  );
}
