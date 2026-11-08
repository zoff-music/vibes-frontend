import { useFetcher, useRootData } from '@kasperrt/smolter/preact';
import { showRateLimitMessageToast } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import { type ChangeEvent, useEffect, useState } from 'preact/compat';
import type { AdminActionData } from '../routes/admin/action';
import type { AdminLoaderData } from '../utils/admin-session/loader';

interface LayoutProps {
  children: import('preact').ComponentChildren;
}

export function AdminLayout({ children }: LayoutProps) {
  const {
    admin: { session },
  } = useRootData<{ admin: AdminLoaderData }>();
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
    setUsername(event.currentTarget.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  if (!session.authorized || !session.user) {
    return (
      <main className="text-theme relative flex items-center justify-center px-6 py-12">
        <div className="relative z-10 w-full max-w-md">
          <div className="panel-strong border-theme-strong rounded-3xl border p-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-black tracking-tight">
                Admin Access
              </h1>
              <p className="text-theme-muted text-sm">
                Sign in with your admin account.
              </p>
            </div>

            <fetcher.Form action="/admin" className="space-y-4" method="post">
              <input name="intent" type="hidden" value="login" />
              <label className="block">
                <span className="text-theme-muted mb-2 block text-xs font-semibold tracking-widest uppercase">
                  Username
                </span>
                <input
                  autoComplete="username"
                  className="border-theme bg-theme-surface text-theme placeholder:text-theme-subtle focus:border-primary focus:shadow-focus-primary w-full rounded-xl border-2 px-4 py-3 font-mono text-base transition-all focus:outline-hidden"
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
                <span className="text-theme-muted mb-2 block text-xs font-semibold tracking-widest uppercase">
                  Password
                </span>
                <input
                  autoComplete="current-password"
                  className="border-theme bg-theme-surface text-theme placeholder:text-theme-subtle focus:border-primary focus:shadow-focus-primary w-full rounded-xl border-2 px-4 py-3 font-mono text-base transition-all focus:outline-hidden"
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
                  className="text-sm text-red-500"
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
    <div className="text-theme relative mx-auto w-full max-w-6xl px-5 py-6 sm:px-6">
      <div className="space-y-8">
        <div className="border-theme border-b pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-theme-subtle text-xs tracking-widest uppercase">
                Zoff administration
              </p>
              <p className="text-2xl font-black tracking-tight">
                {session.user.username}
              </p>
            </div>

            <fetcher.Form action="/admin" method="post">
              <input name="intent" type="hidden" value="logout" />
              <Button disabled={isSubmitting} type="submit" variant="secondary">
                Sign Out
              </Button>
            </fetcher.Form>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
