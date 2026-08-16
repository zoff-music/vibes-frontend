import type { Providers, RoomSettings, SourceType } from '@vibes/models';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { TerminalButton, TerminalSection } from './TerminalPrimitives';
import { TerminalShell } from './TerminalShell';

type BooleanRoomSetting = keyof Pick<
  RoomSettings,
  | 'allowDuplicates'
  | 'democraticSkip'
  | 'loopQueue'
  | 'onlyAdminAddSongs'
  | 'public'
  | 'removeOnPlay'
  | 'skipAllowed'
>;

interface TerminalCreateRoomProps {
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

interface TerminalCreateSettingProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

function TerminalCreateSetting({
  checked,
  disabled = false,
  label,
  onChange,
}: TerminalCreateSettingProps) {
  return (
    <button
      aria-pressed={checked}
      className="flex w-full cursor-pointer items-center justify-between gap-2 border-[#71f5ad]/20 border-b px-1 py-2.5 text-left font-mono text-[#b9ffda] text-xs uppercase hover:bg-[#071b12] disabled:cursor-not-allowed disabled:opacity-35"
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

export function TerminalCreateRoom({
  availability,
  availabilityError,
  error,
  isCreating,
  isGeneratingName,
  mode,
  name,
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

  return (
    <TerminalShell channel="ROOM COMPILER" title="CREATE SESSION">
      {renderForm(
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border border-[#71f5ad]/30 p-2">
            <Link
              className="border border-[#71f5ad]/55 bg-[#071b12] px-3 py-2 text-[#b9ffda] text-xs uppercase hover:border-[#a6ffd0] hover:bg-[#0d2a1c]"
              to="/"
            >
              [ESC] DIRECTORY
            </Link>
            <p className="text-right text-[#71f5ad]/60 text-[0.62rem] uppercase tracking-[0.16em]">
              ROOM PROTOCOL COMPILER / REV 19.89
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <TerminalSection label="ROOM IDENTITY" status={availabilityLabel}>
                <label
                  className="mb-2 block text-[#71f5ad]/60 text-[0.6rem] uppercase tracking-[0.14em]"
                  htmlFor="terminal-room-name"
                >
                  CHANNEL NAME
                </label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    className="min-w-0 flex-1 border border-[#71f5ad]/50 bg-black/40 px-3 py-2.5 font-mono text-[#e0ffef] text-sm placeholder:text-[#71f5ad]/30 focus:border-[#a6ffd0] focus:outline-none"
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
                </div>
                {availabilityError && (
                  <p className="mt-2 text-[#ff8e8e] text-xs">
                    {availabilityError}
                  </p>
                )}
              </TerminalSection>

              <TerminalSection
                label="ADMIN KEY"
                status={password ? 'SET' : 'OPEN'}
              >
                <label
                  className="mb-2 block text-[#71f5ad]/60 text-[0.6rem] uppercase tracking-[0.14em]"
                  htmlFor="terminal-room-password"
                >
                  OPTIONAL CONTROL PASSWORD
                </label>
                <input
                  className="w-full border border-[#71f5ad]/50 bg-black/40 px-3 py-2.5 font-mono text-[#e0ffef] text-sm placeholder:text-[#71f5ad]/30 focus:border-[#a6ffd0] focus:outline-none"
                  id="terminal-room-password"
                  name="password"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="LEAVE EMPTY FOR OPEN CONTROL"
                  type="password"
                  value={password}
                />
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
                <TerminalCreateSetting
                  checked={settings.skipAllowed}
                  label="ALLOW SKIP"
                  onChange={(checked) =>
                    onBooleanSettingChange('skipAllowed', checked)
                  }
                />
                <TerminalCreateSetting
                  checked={settings.democraticSkip}
                  label="DEMOCRATIC SKIP"
                  onChange={(checked) =>
                    onBooleanSettingChange('democraticSkip', checked)
                  }
                />
                <TerminalCreateSetting
                  checked={settings.loopQueue}
                  label="LOOP QUEUE"
                  onChange={(checked) =>
                    onBooleanSettingChange('loopQueue', checked)
                  }
                />
                <TerminalCreateSetting
                  checked={settings.removeOnPlay}
                  label="REMOVE PLAYED"
                  onChange={(checked) =>
                    onBooleanSettingChange('removeOnPlay', checked)
                  }
                />
                <TerminalCreateSetting
                  checked={settings.allowDuplicates}
                  label="ALLOW DUPLICATES"
                  onChange={(checked) =>
                    onBooleanSettingChange('allowDuplicates', checked)
                  }
                />
                <TerminalCreateSetting
                  checked={settings.onlyAdminAddSongs ?? false}
                  disabled={!password}
                  label="ADMINS ONLY ADD"
                  onChange={(checked) =>
                    onBooleanSettingChange('onlyAdminAddSongs', checked)
                  }
                />
                <TerminalCreateSetting
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

          <button
            className="mt-auto w-full cursor-pointer border border-[#71f5ad] bg-[#71f5ad] px-5 py-3 font-bold font-mono text-[#03150d] text-sm uppercase tracking-[0.12em] hover:bg-[#a6ffd0] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!name.trim() || isCreating}
            type="submit"
          >
            {isCreating ? 'COMPILING ROOM...' : '[ EXECUTE / START SESSION ]'}
          </button>
        </div>,
      )}
    </TerminalShell>
  );
}
