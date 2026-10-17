import { useFetcher, useRootData } from '@kasperrt/smolter/preact';
import { showRateLimitMessageToast } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import { type ChangeEvent, useEffect, useState } from 'preact/compat';
import type { AdminActionData } from '../routes/admin/action';
import type { AdminLoaderData } from '../utils/admin-session/loader';

interface LayoutProps {
  children: import('preact').ComponentChildren;
}

export default function AdminLayout({ children }: LayoutProps) {
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
      <main className="relative flex items-center justify-center px-6 py-12 text-theme">
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

            <fetcher.Form action="/admin" className="space-y-4" method="post">
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
    <div className="relative mx-auto w-full max-w-6xl px-5 py-6 text-theme sm:px-6">
      <div className="space-y-8">
        <div className="border-theme border-b pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-theme-subtle text-xs uppercase tracking-widest">
                Zoff administration
              </p>
              <p className="font-black text-2xl tracking-tight">
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
