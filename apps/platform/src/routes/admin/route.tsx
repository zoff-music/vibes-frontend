import { useAdminEvents } from '@vibes/api';
import type { AdminRoomSummary } from '@vibes/models';
import { Button, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';
import { JSX, useEffect, useMemo, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
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
                variant="admin-primary"
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
    <div className="min-h-screen bg-surface px-6 py-10 text-ink dark:bg-gray-900 dark:text-white">
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
            <Button onClick={fetchRooms} variant="admin-outline">
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="admin-neutral">
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="glass flex flex-col gap-4 rounded-2xl border-2 border-ink/10 p-5 transition-all hover:border-primary/30 md:flex-row md:items-center md:justify-between dark:border-gray-700"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-ink text-xl dark:text-white">
                    {room.name}
                  </h2>
                  <span className="rounded-full bg-ink/10 px-3 py-1 font-mono text-ink/60 text-xs uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">
                    {room.id}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-ink/60 text-sm dark:text-gray-400">
                  <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
                    {room.userCount} viewers
                  </span>
                  <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
                    {room.songCount} songs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
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
          ))}
        </div>
      </div>
    </div>
  );
}
