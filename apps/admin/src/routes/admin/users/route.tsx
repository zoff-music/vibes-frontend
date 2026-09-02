import { showRateLimitMessageToast } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import {
  type ChangeEvent,
  type MouseEvent,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { useFetcher, useLoaderData, useOutletContext } from 'react-router';
import type { AdminOutletContext } from '../route';
import type { AdminUsersActionData } from './action';
import { action } from './action';
import { AdminUserCard } from './components/AdminUserCard';
import type { AdminUsersLoaderData } from './loader';
import { loader } from './loader';

export { action, loader };

export default function AdminUsers() {
  const { users } = useLoaderData<AdminUsersLoaderData>();
  const { user: currentUser } = useOutletContext<AdminOutletContext>();
  const fetcher = useFetcher<AdminUsersActionData>();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetAdminID, setResetAdminID] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.rateLimitMessage) {
      showRateLimitMessageToast(fetcher.data.rateLimitMessage);
    }
    if (fetcher.data?.completedIntent === 'createUser') {
      setUsername('');
      setNewPassword('');
    }
    if (fetcher.data?.completedIntent === 'resetPassword') {
      setResetAdminID(null);
      setResetPassword('');
    }
  }, [fetcher.data]);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleNewPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value);
  };

  const handleResetPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setResetPassword(event.target.value);
  };

  const handleStartReset = (event: MouseEvent<HTMLButtonElement>) => {
    setResetAdminID(event.currentTarget.value);
    setResetPassword('');
  };

  const cancelReset = () => {
    setResetAdminID(null);
    setResetPassword('');
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    const admin = users.find((item) => item.id === event.currentTarget.value);
    if (!admin || admin.id === currentUser.id || isSubmitting) {
      return;
    }

    const confirmed = window.confirm(`Delete admin user "${admin.username}"?`);
    if (!confirmed) {
      return;
    }

    fetcher.submit(
      {
        intent: 'deleteUser',
        adminId: admin.id,
      },
      { method: 'post' },
    );
  };

  const handleResetPassword = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetcher.submit(event.currentTarget, { method: 'post' });
  };

  return (
    <main className="space-y-6">
      <header>
        <h1 className="font-black text-3xl tracking-tight">Admin Users</h1>
        <p className="text-sm text-theme-muted">
          Create accounts, reset another admin&apos;s password, or revoke their
          access.
        </p>
      </header>

      {fetcher.data?.error && !fetcher.data.rateLimitMessage && (
        <p
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 text-sm"
          role="alert"
        >
          {fetcher.data.error}
        </p>
      )}
      {fetcher.data?.message && (
        <p
          aria-live="polite"
          className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 text-sm dark:text-green-300"
          role="status"
        >
          {fetcher.data.message}
        </p>
      )}

      <section className="panel-surface rounded-2xl border border-theme p-5">
        <h2 className="font-black text-xl tracking-tight">Create admin user</h2>
        <p className="mt-1 text-sm text-theme-muted">
          Usernames are lowercase. Passwords must contain at least 16
          characters.
        </p>

        <fetcher.Form className="mt-5 grid gap-4 md:grid-cols-2" method="post">
          <input name="intent" type="hidden" value="createUser" />
          <label className="block">
            <span className="mb-2 block font-semibold text-theme-muted text-xs uppercase tracking-widest">
              Username
            </span>
            <input
              autoComplete="off"
              className="w-full rounded-xl border border-theme bg-theme-surface px-4 py-3 font-mono text-base text-theme outline-hidden transition-colors focus:border-primary"
              disabled={isSubmitting}
              maxLength={64}
              minLength={3}
              name="username"
              onChange={handleUsernameChange}
              pattern="[A-Za-z0-9_-]+"
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
              autoComplete="new-password"
              className="w-full rounded-xl border border-theme bg-theme-surface px-4 py-3 font-mono text-base text-theme outline-hidden transition-colors focus:border-primary"
              disabled={isSubmitting}
              maxLength={128}
              minLength={16}
              name="password"
              onChange={handleNewPasswordChange}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <div className="md:col-span-2">
            <Button
              disabled={!username || newPassword.length < 16 || isSubmitting}
              type="submit"
              variant="primary"
            >
              Create Admin
            </Button>
          </div>
        </fetcher.Form>
      </section>

      <section className="space-y-3">
        {users.map((admin) => (
          <AdminUserCard
            admin={admin}
            currentUserID={currentUser.id}
            isSubmitting={isSubmitting}
            key={admin.id}
            onCancelReset={cancelReset}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            onResetPasswordChange={handleResetPasswordChange}
            onStartReset={handleStartReset}
            resetAdminID={resetAdminID}
            resetPassword={resetPassword}
          />
        ))}
      </section>
    </main>
  );
}
