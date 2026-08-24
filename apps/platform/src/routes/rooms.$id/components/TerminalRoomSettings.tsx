import {
  type Providers,
  type Room,
  type RoomSettings,
  type RoomUpdate,
  type SourceType,
} from '@vibes/models';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalField,
  TerminalInput,
  TerminalInputGroup,
  TerminalModal,
  TerminalToggle,
} from '@vibes/ui/konami';
import type { KeyboardEvent, RefObject } from 'react';
import type { Theme } from '../../../stores/themeStore';

interface TerminalRoomSettingsProps {
  adminError: string | null;
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

export function TerminalRoomSettings({
  adminError,
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
      | 'playlistImport'
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
    <TerminalModal
      ariaLabelledBy="terminal-settings-title"
      bodyClassName="!p-0"
      className="!max-w-3xl"
      footer="SETTINGS SYNC ACTIVE / CHANGES TRANSMIT IMMEDIATELY"
      isOpen
      onClose={onClose}
      panelRef={settingsMenuRef}
      size="lg"
      title="ZOFF CONFIG.SYS"
    >
      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div className="border-[#71f5ad]/25 p-4 lg:border-r">
          <h3 className="mb-2 text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]">
            ROOM FLAGS
          </h3>
          <TerminalToggle
            checked={room.settings.skipAllowed}
            disabled={accessRestricted || room.mode === 'host'}
            label="ALLOW SKIP"
            onChange={(checked) => updateBooleanSetting('skipAllowed', checked)}
          />
          <TerminalToggle
            checked={room.settings.democraticSkip}
            disabled={accessRestricted || room.mode === 'host'}
            label="DEMOCRATIC SKIP"
            onChange={(checked) =>
              updateBooleanSetting('democraticSkip', checked)
            }
          />
          <TerminalToggle
            checked={room.settings.loopQueue}
            disabled={accessRestricted}
            label="LOOP QUEUE"
            onChange={(checked) => updateBooleanSetting('loopQueue', checked)}
          />
          <TerminalToggle
            checked={room.settings.allowDuplicates}
            disabled={accessRestricted}
            label="ALLOW DUPLICATES"
            onChange={(checked) =>
              updateBooleanSetting('allowDuplicates', checked)
            }
          />
          <TerminalToggle
            checked={room.settings.removeOnPlay}
            disabled={accessRestricted}
            label="REMOVE PLAYED"
            onChange={(checked) =>
              updateBooleanSetting('removeOnPlay', checked)
            }
          />
          <TerminalToggle
            checked={room.settings.onlyAdminAddSongs ?? false}
            disabled={accessRestricted}
            label="ADMINS ONLY ADD"
            onChange={(checked) => {
              if (checked && !room.hasPassword && !adminPassword) return;
              updateBooleanSetting('onlyAdminAddSongs', checked);
            }}
          />
          <TerminalToggle
            checked={room.settings.playlistImport}
            disabled={accessRestricted}
            label="PLAYLIST IMPORT"
            onChange={(checked) =>
              updateBooleanSetting('playlistImport', checked)
            }
          />
          <TerminalToggle
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
                const enabled = room.settings.enabledSources.includes(provider);
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
            <TerminalField
              htmlFor="terminal-admin-password"
              label="ADMIN ACCESS"
            >
              <TerminalInputGroup>
                <TerminalInput
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
              </TerminalInputGroup>
              {adminError && (
                <p
                  aria-live="polite"
                  className="mt-2 text-[#ff8ca8] text-xs"
                  role="alert"
                >
                  {adminError}
                </p>
              )}
            </TerminalField>
          )}
          {isAdmin && (
            <TerminalFeedback tone="success">
              ADMIN PRIVILEGES: GRANTED
            </TerminalFeedback>
          )}
        </div>
      </div>
    </TerminalModal>
  );
}
