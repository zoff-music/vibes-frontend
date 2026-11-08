import type { AdminUser } from '@vibes/models';
import { Button } from '@vibes/ui/web';
import type { ChangeEvent, FormEvent, MouseEvent } from 'preact/compat';

interface AdminUserCardProps {
  admin: AdminUser;
  currentUserID: string;
  isSubmitting: boolean;
  onCancelReset: () => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
  onResetPassword: (event: FormEvent<HTMLFormElement>) => void;
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
    <article className="panel-surface border-theme rounded-2xl border p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{admin.username}</h2>
            {isCurrentUser && (
              <span className="bg-secondary/15 text-secondary rounded-full px-3 py-1 text-xs font-bold">
                Current account
              </span>
            )}
          </div>
          <p className="text-theme-subtle mt-1 text-xs">
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
          className="border-theme mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end"
          method="post"
          onSubmit={onResetPassword}
        >
          <input name="intent" type="hidden" value="resetPassword" />
          <input name="adminId" type="hidden" value={admin.id} />
          <label className="min-w-0 flex-1">
            <span className="text-theme-muted mb-2 block text-xs font-semibold tracking-widest uppercase">
              New password
            </span>
            <input
              autoComplete="new-password"
              className="border-theme bg-theme-surface text-theme focus:border-primary w-full rounded-xl border px-4 py-3 font-mono text-base outline-hidden transition-colors"
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
