import { useAdminEvents } from '@vibes/api';
import type { AdminRoomSummary } from '@vibes/models';
import { Button, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';
import { JSX, useEffect, useMemo, useState } from 'react';
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from 'react-router';
import type { AdminActionData } from './action';
import { action } from './action';
import type { AdminLoaderData } from './loader';
import { loader } from './loader';

export { action, loader };

const sourceIcons: Record<string, JSX.Element> = {
  youtube: <YouTubeIcon className="h-4 w-4 text-red-500" />,
  spotify: <SpotifyIcon className="h-4 w-4 text-green-500" />,
  soundcloud: <SoundCloudIcon className="h-4 w-4 text-orange-500" />,
};

export default function Admin() {
  const loaderData = useLoaderData() as AdminLoaderData;
  const fetcher = useFetcher<AdminActionData>();
  const [rooms, setRooms] = useState<AdminRoomSummary[]>(
    loaderData.adminRooms ?? [],
  );
  const [isAuthorized, setIsAuthorized] = useState<boolean>(
    loaderData.adminAuthorized ?? false,
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(
    !loaderData.adminAuthorized,
  );
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const isLoading = fetcher.state !== 'idle';

  const hasRooms = rooms.length > 0;

  const totalViewers = useMemo(
    () => rooms.reduce((acc, room) => acc + room.userCount, 0),
    [rooms],
  );

  const fetchRooms = () => {
    fetcher.submit({ intent: 'refresh' }, { method: 'post' });
  };

  useAdminEvents({ enabled: isAuthorized, onRoomsUpdate: setRooms });

  useEffect(() => {
    if (!isAuthorized) return;
    fetchRooms();
  }, [isAuthorized]);

  useEffect(() => {
    if (loaderData.adminAuthorized) {
      setIsCheckingAuth(false);
      return;
    }

    fetcher.submit({ intent: 'refresh' }, { method: 'post' });
  }, [loaderData.adminAuthorized]);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.rooms) {
      setRooms(fetcher.data.rooms);
      setEditingRoomId(null);
      setEditingName('');
    }
    if (typeof fetcher.data.authorized === 'boolean') {
      setIsAuthorized(fetcher.data.authorized);
    }
    if (fetcher.data.error) {
      setErrorMessage(fetcher.data.error);
    } else {
      setErrorMessage(null);
    }
    setIsCheckingAuth(false);
    if (fetcher.data.authorized) {
      setPassword('');
    }
  }, [fetcher.data]);

  const handleLogin = () => {
    if (!password.trim() || isLoading) {
      return;
    }

    setErrorMessage(null);
    fetcher.submit(
      {
        intent: 'login',
        password: password.trim(),
      },
      { method: 'post' },
    );
  };

  const handleLogout = () => {
    setErrorMessage(null);
    fetcher.submit({ intent: 'logout' }, { method: 'post' });
  };

  const startRename = (room: AdminRoomSummary) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
  };

  const cancelRename = () => {
    setEditingRoomId(null);
    setEditingName('');
  };

  const saveRename = () => {
    const name = editingName.trim();
    if (!editingRoomId || !name || isLoading) {
      return;
    }

    setErrorMessage(null);
    fetcher.submit(
      {
        intent: 'renameRoom',
        roomId: editingRoomId,
        name,
      },
      { method: 'post' },
    );
  };

  const clearPassword = (room: AdminRoomSummary) => {
    if (!room.hasAdminPassword || isLoading) {
      return;
    }

    setErrorMessage(null);
    fetcher.submit(
      {
        intent: 'clearPassword',
        roomId: room.id,
      },
      { method: 'post' },
    );
  };

  const deleteRoom = (room: AdminRoomSummary) => {
    if (isLoading) {
      return;
    }

    const confirmed = window.confirm(`Delete room "${room.name}"?`);
    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    fetcher.submit(
      {
        intent: 'deleteRoom',
        roomId: room.id,
      },
      { method: 'post' },
    );
  };

  if (isCheckingAuth) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="glass rounded-3xl border-2 border-ink/10 p-8 text-center dark:border-gray-700">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-ink/20 border-t-primary" />
          <p className="text-ink/60 text-sm dark:text-gray-400">
            Checking admin session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl border-2 border-ink/10 p-8 text-center dark:border-gray-700">
            <h1 className="mb-2 font-black text-3xl text-ink tracking-tight dark:text-white">
              Admin Access
            </h1>
            <p className="mb-6 text-ink/60 text-sm dark:text-gray-400">
              Enter the admin password to view live room stats.
            </p>

            <div className="space-y-4 text-left">
              <label className="block font-semibold text-ink/80 text-xs uppercase tracking-widest dark:text-gray-400">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
                className="w-full rounded-xl border-2 border-ink/20 bg-surface px-4 py-3 font-mono text-base text-ink transition-all placeholder:text-ink/40 focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,46,151,0.1)] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                placeholder="Password"
                disabled={isLoading}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              <Button
                onClick={handleLogin}
                disabled={!password.trim() || isLoading}
                variant="primary"
                className="w-full"
              >
                {isLoading ? 'Checking...' : 'Enter Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface px-4 py-10 text-ink sm:px-6 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-black text-3xl tracking-tight">Live Rooms</h1>
            <p className="text-ink/60 text-sm dark:text-gray-400">
              {hasRooms
                ? `${rooms.length} rooms, ${totalViewers} viewers online`
                : 'No active rooms yet'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchRooms} variant="tertiary">
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="secondary">
              Sign Out
            </Button>
          </div>
        </header>
        {errorMessage && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 text-sm">
            {errorMessage}
          </p>
        )}

        <div className="grid gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="glass flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border-2 border-ink/10 p-5 transition-all hover:border-primary/30 dark:border-gray-700"
            >
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <h2 className="max-w-full break-words font-bold text-ink text-xl dark:text-white">
                      {room.name}
                    </h2>
                    <span className="max-w-full truncate rounded-full bg-ink/10 px-3 py-1 font-mono text-ink/60 text-xs uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">
                      {room.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-ink/60 text-sm dark:text-gray-400">
                    <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
                      {room.userCount} viewers
                    </span>
                    <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
                      {room.songCount} songs
                    </span>
                    <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
                      {room.hasAdminPassword ? 'password set' : 'no password'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {room.activeSources.length === 0 ? (
                    <span className="text-ink/50 text-xs uppercase tracking-widest dark:text-gray-500">
                      No sources
                    </span>
                  ) : (
                    room.activeSources.map((source) => (
                      <span
                        key={source}
                        className="rounded-lg bg-ink/5 p-2 dark:bg-gray-800"
                        title={source}
                      >
                        {sourceIcons[source]}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {editingRoomId === room.id && (
                <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-ink/10 bg-ink/5 p-3 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800/60">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && saveRename()}
                    className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-surface px-3 py-2 text-ink text-sm outline-hidden transition-all focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={saveRename}
                      disabled={!editingName.trim() || isLoading}
                      variant="tertiary"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={cancelRename}
                      disabled={isLoading}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/rooms/${encodeURIComponent(room.name)}`}
                  className="inline-flex items-center justify-center rounded-xl border border-primary/40 px-4 py-2 font-semibold text-primary text-sm transition-all hover:border-primary hover:bg-primary/10 dark:text-primary-light"
                >
                  Open Room
                </a>
                <Button
                  onClick={() => startRename(room)}
                  disabled={isLoading || editingRoomId === room.id}
                  variant="tertiary"
                >
                  Rename
                </Button>
                <Button
                  onClick={() => clearPassword(room)}
                  disabled={!room.hasAdminPassword || isLoading}
                  variant="secondary"
                >
                  Clear Password
                </Button>
                <Button
                  onClick={() => deleteRoom(room)}
                  disabled={isLoading}
                  variant="secondary"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Could not load the admin dashboard.';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl border-2 border-ink/10 p-8 text-center dark:border-gray-700">
          <h1 className="mb-2 font-black text-3xl text-ink tracking-tight dark:text-white">
            Admin Error
          </h1>
          <p className="mb-6 text-ink/60 text-sm dark:text-gray-400">
            {message}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="w-full"
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
