import type { Providers, RoomSettings, SourceType } from '@vibes/models';
import type { ReactNode } from 'react';
import { TerminalButton } from './TerminalButton';
import { TerminalField, TerminalInputGroup } from './TerminalField';
import { TerminalInput } from './TerminalInput';
import { TerminalSection } from './TerminalSection';
import { TerminalShell } from './TerminalShell';
import { TerminalToggle } from './TerminalToggle';
import { useTerminalShortcuts } from './useTerminalShortcuts';

type BooleanRoomSetting = keyof Pick<
  RoomSettings,
  | 'allowDuplicates'
  | 'democraticSkip'
  | 'onlyAdminAddSongs'
  | 'playlistImport'
  | 'public'
  | 'removeOnPlay'
  | 'skipAllowed'
>;

export interface TerminalCreateRoomProps {
  availability: 'idle' | 'checking' | 'available' | 'taken' | 'error';
  availabilityError: string | null;
  error: string | null;
  isCreating: boolean;
  isGeneratingName: boolean;
  mode: 'server' | 'host';
  name: string;
  onBooleanSettingChange: (
    setting: BooleanRoomSetting,
    checked: boolean,
  ) => void;
  onBack: () => void;
  onGenerateName: () => void;
  onModeChange: (mode: 'server' | 'host') => void;
  onNameChange: (name: string) => void;
  onPasswordChange: (password: string) => void;
  onSourceToggle: (source: SourceType) => void;
  password: string;
  providers: Providers;
  renderForm: (content: ReactNode) => ReactNode;
  settings: RoomSettings;
}

export function TerminalCreateRoom({
  availability,
  availabilityError,
  error,
  isCreating,
  isGeneratingName,
  mode,
  name,
  onBack,
  onBooleanSettingChange,
  onGenerateName,
  onModeChange,
  onNameChange,
  onPasswordChange,
  onSourceToggle,
  password,
  providers,
  renderForm,
  settings,
}: TerminalCreateRoomProps) {
  const availabilityLabel =
    availability === 'idle' ? 'WAITING' : availability.toUpperCase();

  useTerminalShortcuts([{ key: 'Escape', onTrigger: onBack }]);

  return (
    <TerminalShell channel="ROOM COMPILER" title="CREATE SESSION">
      {renderForm(
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border border-[#71f5ad]/30 p-2">
            <TerminalButton aria-keyshortcuts="Escape" onClick={onBack}>
              [ESC] DIRECTORY
            </TerminalButton>
            <p className="text-right text-[#71f5ad]/60 text-[0.62rem] uppercase tracking-[0.16em]">
              ROOM PROTOCOL COMPILER / REV 19.89
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <TerminalSection label="ROOM IDENTITY" status={availabilityLabel}>
                <TerminalField
                  error={availabilityError}
                  htmlFor="terminal-room-name"
                  label="CHANNEL NAME"
                >
                  <TerminalInputGroup>
                    <TerminalInput
                      autoFocus
                      id="terminal-room-name"
                      name="name"
                      onChange={(event) => onNameChange(event.target.value)}
                      placeholder="CHANNEL NAME"
                      type="text"
                      value={name}
                    />
                    <TerminalButton
                      disabled={isGeneratingName || isCreating}
                      onClick={onGenerateName}
                    >
                      {isGeneratingName ? '[ ... ]' : '[ RANDOM ]'}
                    </TerminalButton>
                  </TerminalInputGroup>
                </TerminalField>
              </TerminalSection>

              <TerminalSection
                label="ADMIN KEY"
                status={password ? 'SET' : 'OPEN'}
              >
                <TerminalField
                  htmlFor="terminal-room-password"
                  label="OPTIONAL CONTROL PASSWORD"
                >
                  <TerminalInput
                    className="w-full"
                    id="terminal-room-password"
                    name="password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="LEAVE EMPTY FOR OPEN CONTROL"
                    type="password"
                    value={password}
                  />
                </TerminalField>
              </TerminalSection>

              <TerminalSection label="PROVIDER DRIVERS" status="CONFIG">
                <div className="grid grid-cols-3 gap-2">
                  {providers.map((provider) => {
                    const enabled = settings.enabledSources.includes(provider);
                    return (
                      <TerminalButton
                        className="px-2 text-center text-[0.62rem]"
                        key={provider}
                        onClick={() => onSourceToggle(provider)}
                      >
                        [{enabled ? 'ON' : '--'}] {provider}
                      </TerminalButton>
                    );
                  })}
                </div>
              </TerminalSection>
            </div>

            <div className="space-y-4">
              <TerminalSection
                label="PLAYBACK MODE"
                status={mode.toUpperCase()}
              >
                <div className="grid grid-cols-2 gap-2">
                  <TerminalButton onClick={() => onModeChange('server')}>
                    [{mode === 'server' ? 'X' : ' '}] SERVER
                  </TerminalButton>
                  <TerminalButton onClick={() => onModeChange('host')}>
                    [{mode === 'host' ? 'X' : ' '}] HOST
                  </TerminalButton>
                </div>
              </TerminalSection>

              <TerminalSection label="ROOM FLAGS" status="EDITABLE">
                <TerminalToggle
                  checked={settings.skipAllowed}
                  label="ALLOW SKIP"
                  onChange={(checked) =>
                    onBooleanSettingChange('skipAllowed', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.democraticSkip}
                  label="DEMOCRATIC SKIP"
                  onChange={(checked) =>
                    onBooleanSettingChange('democraticSkip', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.removeOnPlay}
                  label="REMOVE PLAYED"
                  onChange={(checked) =>
                    onBooleanSettingChange('removeOnPlay', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.allowDuplicates}
                  label="ALLOW DUPLICATES"
                  onChange={(checked) =>
                    onBooleanSettingChange('allowDuplicates', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.onlyAdminAddSongs ?? false}
                  disabled={!password}
                  label="ADMINS ONLY ADD"
                  onChange={(checked) =>
                    onBooleanSettingChange('onlyAdminAddSongs', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.playlistImport}
                  label="PLAYLIST IMPORT"
                  onChange={(checked) =>
                    onBooleanSettingChange('playlistImport', checked)
                  }
                />
                <TerminalToggle
                  checked={settings.public}
                  disabled={!password}
                  label="PUBLIC DIRECTORY"
                  onChange={(checked) =>
                    onBooleanSettingChange('public', checked)
                  }
                />
              </TerminalSection>
            </div>
          </div>

          {error && (
            <p className="border border-[#ff8e8e]/50 p-3 text-[#ff8e8e] text-xs">
              COMPILER ERROR: {error}
            </p>
          )}

          <TerminalButton
            className="mt-auto w-full px-5 py-3 text-sm tracking-[0.12em]"
            disabled={!name.trim() || isCreating}
            type="submit"
            variant="primary"
          >
            {isCreating ? 'COMPILING ROOM...' : '[ EXECUTE / START SESSION ]'}
          </TerminalButton>
        </div>,
      )}
    </TerminalShell>
  );
}
