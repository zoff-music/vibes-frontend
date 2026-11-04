import {
  useFetcher,
  useLoaderData,
  useRootData,
} from '@kasperrt/smolter/preact';
import { showRateLimitMessageToast } from '@vibes/shared';
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useState,
} from 'preact/compat';
import type { AdminLoaderData } from '../../../utils/admin-session/loader';
import type { AdminUsersActionData } from '../action';
import type { AdminUsersLoaderData } from '../loader';

export function useAdminUsers() {
  const { users } = useLoaderData<AdminUsersLoaderData>();
  const {
    admin: {
      session: { user: currentUser },
    },
  } = useRootData<{ admin: AdminLoaderData }>();
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
    setUsername(event.currentTarget.value);
  };

  const handleNewPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.currentTarget.value);
  };

  const handleResetPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setResetPassword(event.currentTarget.value);
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

    if (!admin || admin.id === currentUser?.id || isSubmitting) {
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

  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetcher.submit(event.currentTarget, { method: 'post' });
  };
  return {
    users,
    currentUser,
    fetcher,
    username,
    newPassword,
    resetAdminID,
    resetPassword,
    isSubmitting,
    handleUsernameChange,
    handleNewPasswordChange,
    handleResetPasswordChange,
    handleStartReset,
    cancelReset,
    handleDelete,
    handleResetPassword,
  };
}
