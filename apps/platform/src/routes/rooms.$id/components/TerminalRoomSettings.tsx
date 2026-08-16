import {
  type Providers,
  type Room,
  type RoomSettings,
  type RoomUpdate,
  type SourceType,
} from '@vibes/models';
import type { KeyboardEvent, RefObject } from 'react';
import { TerminalButton } from '../../../components/konami/TerminalPrimitives';
import type { Theme } from '../../../stores/themeStore';

interface TerminalRoomSettingsProps {
  adminPassword: string;
  currentTheme: Theme;
  displayRoom: Room | null;
  isAdmin: boolean;
  isAuthenticating: boolean;
  onAdminPasswordChange: (value: string) => void;
  onClose: () => void;
  onJoinAdmin: () => void;
  onOpenRemoteControl: () => void;
  onShareRoom: () => void;
  onToggleDarkMode: () => void;
  providers: Providers;
  room: Room | null;
  settingsMenuRef?: RefObject<HTMLDivElement | null>;
  updateRoom: (data: RoomUpdate) => void;
  updateRoomSettings: (settings: RoomSettings) => void;
}

interface TerminalSettingRowProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

function TerminalSettingRow({
  checked,
  disabled = false,
  label,
  onChange,
}: TerminalSettingRowProps) {
  return (
    <button
      aria-pressed={checked}
      className="flex w-full cursor-pointer items-center justify-between gap-3 border-[#71f5ad]/20 border-b px-1 py-2.5 text-left font-mono text-[#b9ffda] text-xs uppercase hover:bg-[#071b12] disabled:cursor-not-allowed disabled:opacity-35"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span>{label}</span>
      <span className={checked ? 'text-[#71f5ad]' : 'text-[#a6ffd0]/40'}>
        [{checked ? 'ON ' : 'OFF'}]
      </span>
    </button>
  );
}

export function TerminalRoomSettings({
  adminPassword,
  currentTheme,
  displayRoom,
  isAdmin,
  isAuthenticating,
  onAdminPasswordChange,
  onClose,
  onJoinAdmin,
  onOpenRemoteControl,
  onShareRoom,
  onToggleDarkMode,
  providers,
  room,
  settingsMenuRef,
  updateRoom,
  updateRoomSettings,
}: TerminalRoomSettingsProps) {
  if (!room) return null;

  const accessRestricted = room.hasPassword && !isAdmin;
  const updateBooleanSetting = (
    setting: keyof Pick<
      RoomSettings,
      | 'allowDuplicates'
      | 'democraticSkip'
      | 'loopQueue'
      | 'onlyAdminAddSongs'
      | 'public'
      | 'removeOnPlay'
      | 'skipAllowed'
    >,
    checked: boolean,
  ) => {
    updateRoomSettings({ ...room.settings, [setting]: checked });
  };
  const handleSourceToggle = (source: SourceType) => {
    const enabled = room.settings.enabledSources.includes(source);
    const enabledSources = enabled
      ? room.settings.enabledSources.filter((candidate) => candidate !== source)
      : [...room.settings.enabledSources, source];
    updateRoomSettings({ ...room.settings, enabledSources });
  };
  const handleAdminKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onJoinAdmin();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#010705]/92 p-3 sm:p-6">
      <button
        aria-label="Close settings"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="terminal-settings-title"
        className="relative z-10 flex max-h-[min(50rem,calc(100dvh-2rem))] w-full max-w-3xl flex-col border border-[#71f5ad] bg-[#020e09] shadow-[0_0_4rem_rgba(49,255,154,0.15)]"
        ref={settingsMenuRef}
      >
        <header className="flex items-center justify-between gap-4 bg-[#71f5ad] px-4 py-2 font-bold text-[#03150d] text-xs uppercase">
          <h2 id="terminal-settings-title">ZOFF CONFIG.SYS</h2>
          <button
            className="cursor-pointer border border-[#03150d]/40 px-2 py-1 font-mono hover:bg-[#03150d] hover:text-[#71f5ad]"
            onClick={onClose}
            type="button"
          >
            [ESC] CLOSE
          </button>
        </header>
        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2">
          <div className="border-[#71f5ad]/25 p-4 lg:border-r">
            <h3 className="mb-2 text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]">
              ROOM FLAGS
            </h3>
            <TerminalSettingRow
              checked={room.settings.skipAllowed}
              disabled={accessRestricted || room.mode === 'host'}
              label="ALLOW SKIP"
              onChange={(checked) =>
                updateBooleanSetting('skipAllowed', checked)
              }
            />
            <TerminalSettingRow
              checked={room.settings.democraticSkip}
              disabled={accessRestricted || room.mode === 'host'}
              label="DEMOCRATIC SKIP"
              onChange={(checked) =>
                updateBooleanSetting('democraticSkip', checked)
              }
            />
            <TerminalSettingRow
              checked={room.settings.loopQueue}
              disabled={accessRestricted}
              label="LOOP QUEUE"
              onChange={(checked) => updateBooleanSetting('loopQueue', checked)}
            />
            <TerminalSettingRow
              checked={room.settings.allowDuplicates}
              disabled={accessRestricted}
              label="ALLOW DUPLICATES"
              onChange={(checked) =>
                updateBooleanSetting('allowDuplicates', checked)
              }
            />
            <TerminalSettingRow
              checked={room.settings.removeOnPlay}
              disabled={accessRestricted}
              label="REMOVE PLAYED"
              onChange={(checked) =>
                updateBooleanSetting('removeOnPlay', checked)
              }
            />
            <TerminalSettingRow
              checked={room.settings.onlyAdminAddSongs ?? false}
              disabled={accessRestricted}
              label="ADMINS ONLY ADD"
              onChange={(checked) => {
                if (checked && !room.hasPassword && !adminPassword) return;
                updateBooleanSetting('onlyAdminAddSongs', checked);
              }}
            />
            <TerminalSettingRow
              checked={room.settings.public}
              disabled={!room.hasPassword || !isAdmin}
              label="PUBLIC DIRECTORY"
              onChange={(checked) => updateBooleanSetting('public', checked)}
            />
          </div>

          <div className="space-y-5 p-4">
            <div>
              <h3 className="mb-2 text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]">
                PLAYBACK MODE
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <TerminalButton
                  disabled={accessRestricted}
                  onClick={() => updateRoom({ mode: 'server' })}
                >
                  [{room.mode === 'server' ? 'X' : ' '}] SERVER
                </TerminalButton>
                <TerminalButton
                  disabled={accessRestricted}
                  onClick={() => updateRoom({ mode: 'host' })}
                >
                  [{room.mode === 'host' ? 'X' : ' '}] HOST
                </TerminalButton>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]">
                PROVIDER DRIVERS
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {providers.map((provider) => {
                  const enabled =
                    room.settings.enabledSources.includes(provider);
                  return (
                    <TerminalButton
                      className="px-2 text-center text-[0.65rem]"
                      disabled={accessRestricted}
                      key={provider}
                      onClick={() => handleSourceToggle(provider)}
                    >
                      [{enabled ? 'ON' : '--'}] {provider}
                    </TerminalButton>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]">
                TERMINAL COMMANDS
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <TerminalButton onClick={onShareRoom}>[SHARE]</TerminalButton>
                <TerminalButton onClick={onOpenRemoteControl}>
                  [REMOTE]
                </TerminalButton>
                <TerminalButton onClick={onToggleDarkMode}>
                  [THEME] {currentTheme.name}
                </TerminalButton>
              </div>
            </div>

            {!isAdmin && (
              <div>
                <label
                  className="mb-2 block text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]"
                  htmlFor="terminal-admin-password"
                >
                  ADMIN ACCESS
                </label>
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 border border-[#71f5ad]/45 bg-black/40 px-3 py-2 font-mono text-[#e0ffef] text-sm focus:border-[#a6ffd0] focus:outline-none"
                    id="terminal-admin-password"
                    onChange={(event) =>
                      onAdminPasswordChange(event.target.value)
                    }
                    onKeyDown={handleAdminKeyDown}
                    placeholder={
                      displayRoom?.hasPassword ? 'PASSWORD' : 'SET PASSWORD'
                    }
                    type="password"
                    value={adminPassword}
                  />
                  <TerminalButton
                    disabled={isAuthenticating || !adminPassword}
                    onClick={onJoinAdmin}
                  >
                    {isAuthenticating ? '[...]' : '[AUTH]'}
                  </TerminalButton>
                </div>
              </div>
            )}
            {isAdmin && (
              <p className="border border-[#71f5ad]/30 p-3 text-[#71f5ad] text-xs">
                ADMIN PRIVILEGES: GRANTED
              </p>
            )}
          </div>
        </div>
        <footer className="border-[#71f5ad]/30 border-t px-4 py-2 text-[#a6ffd0]/45 text-[0.58rem] uppercase tracking-[0.12em]">
          SETTINGS SYNC ACTIVE / CHANGES TRANSMIT IMMEDIATELY
        </footer>
      </section>
    </div>
  );
}
