import type { AdminUser } from '@vibes/models';
import { Button } from '@vibes/ui/web';
import type { ChangeEvent, MouseEvent, SubmitEvent } from 'react';

interface AdminUserCardProps {
  admin: AdminUser;
  currentUserID: string;
  isSubmitting: boolean;
  onCancelReset: () => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
  onResetPassword: (event: SubmitEvent<HTMLFormElement>) => void;
  onResetPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onStartReset: (event: MouseEvent<HTMLButtonElement>) => void;
  resetAdminID: string | null;
  resetPassword: string;
}

export function AdminUserCard({
  admin,
  currentUserID,
  isSubmitting,
  onCancelReset,
  onDelete,
  onResetPassword,
  onResetPasswordChange,
  onStartReset,
  resetAdminID,
  resetPassword,
}: AdminUserCardProps) {
  const isCurrentUser = admin.id === currentUserID;
  const isResetting = admin.id === resetAdminID;

  return (
    <article className="glass rounded-2xl border-2 border-ink/10 p-5 dark:border-gray-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-xl">{admin.username}</h2>
            {isCurrentUser && (
              <span className="rounded-full bg-secondary/15 px-3 py-1 font-bold text-secondary text-xs">
                Current account
              </span>
            )}
          </div>
          <p className="mt-1 text-ink/50 text-xs dark:text-gray-500">
            Created {adminDateFormatter.format(new Date(admin.createdAt))}
          </p>
        </div>

        {!isCurrentUser && !isResetting && (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isSubmitting}
              onClick={onStartReset}
              value={admin.id}
              variant="tertiary"
            >
              Reset Password
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={onDelete}
              value={admin.id}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {isResetting && (
        <form
          className="mt-4 flex flex-col gap-3 border-ink/10 border-t pt-4 sm:flex-row sm:items-end dark:border-gray-700"
          method="post"
          onSubmit={onResetPassword}
        >
          <input name="intent" type="hidden" value="resetPassword" />
          <input name="adminId" type="hidden" value={admin.id} />
          <label className="min-w-0 flex-1">
            <span className="mb-2 block font-semibold text-ink/80 text-xs uppercase tracking-widest dark:text-gray-400">
              New password
            </span>
            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 font-mono text-base text-ink outline-hidden transition-colors focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              disabled={isSubmitting}
              maxLength={128}
              minLength={16}
              name="password"
              onChange={onResetPasswordChange}
              required
              type="password"
              value={resetPassword}
            />
          </label>
          <div className="flex gap-2">
            <Button
              disabled={resetPassword.length < 16 || isSubmitting}
              type="submit"
              variant="primary"
            >
              Save Password
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={onCancelReset}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}

const adminDateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});
