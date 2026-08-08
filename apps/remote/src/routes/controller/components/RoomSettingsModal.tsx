import {
  Button,
  CloseIcon,
  Input,
  Modal,
  ProviderIcon,
  Toggle,
} from '@vibes/ui';
import type { useFetcher } from 'react-router';
import type { ControllerActionData } from '../action';
import type { ControllerLoaderData } from '../loadController';

interface Props {
  fetcher: ReturnType<typeof useFetcher<ControllerActionData>>;
  isOpen: boolean;
  onClose: () => void;
  room: NonNullable<ControllerLoaderData['room']>;
}

export function RoomSettingsModal({ fetcher, isOpen, onClose, room }: Props) {
  const updateSetting = (setting: string, value: boolean) => {
    fetcher.submit(
      {
        intent: 'updateSetting',
        roomId: room.id,
        setting,
        value: String(value),
      },
      { method: 'post' },
    );
  };

  return (
    <Modal
      ariaLabelledBy="remote-settings-title"
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="remote-settings-title"
          className="font-display text-lg text-theme"
        >
          Room settings
        </h2>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          aria-label="Close settings"
        >
          <CloseIcon className="h-5 w-5" />
        </Button>
      </div>

      {!room.isAdmin && room.hasPassword && (
        <fetcher.Form method="post" className="mt-5 space-y-3">
          <input type="hidden" name="intent" value="joinAdmin" />
          <input type="hidden" name="roomId" value={room.id} />
          <Input
            name="password"
            type="password"
            label="Admin password"
            required
          />
          <Button type="submit" className="w-full" variant="secondary">
            Authenticate
          </Button>
        </fetcher.Form>
      )}

      {room.isAdmin && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(['server', 'host'] as const).map((mode) => (
              <fetcher.Form key={mode} method="post">
                <input type="hidden" name="intent" value="updateMode" />
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="mode" value={mode} />
                <Button
                  type="submit"
                  className="w-full capitalize"
                  variant={room.mode === mode ? 'tertiary-active' : 'tertiary'}
                >
                  {mode} mode
                </Button>
              </fetcher.Form>
            ))}
          </div>
          <Toggle
            checked={room.settings.skipAllowed}
            onChange={(value) => updateSetting('skipAllowed', value)}
            label="Allow skip"
          />
          <Toggle
            checked={room.settings.democraticSkip}
            onChange={(value) => updateSetting('democraticSkip', value)}
            label="Democratic skip"
          />
          <Toggle
            checked={room.settings.loopQueue}
            onChange={(value) => updateSetting('loopQueue', value)}
            label="Loop queue"
          />
          <Toggle
            checked={room.settings.removeOnPlay}
            onChange={(value) => updateSetting('removeOnPlay', value)}
            label="Remove played"
          />
          <Toggle
            checked={room.settings.allowDuplicates}
            onChange={(value) => updateSetting('allowDuplicates', value)}
            label="Allow duplicates"
          />
          <Toggle
            checked={room.settings.onlyAdminAddSongs ?? false}
            onChange={(value) => updateSetting('onlyAdminAddSongs', value)}
            label="Admins only add"
          />
          <Toggle
            checked={room.settings.public}
            disabled={!room.hasPassword}
            onChange={(value) => updateSetting('public', value)}
            label="Public room"
            description={
              room.hasPassword
                ? 'Show this room on the live room browser.'
                : 'Set an admin password before making a room public.'
            }
          />

          <div className="rounded-2xl border border-theme bg-theme-surface p-4">
            <p className="mb-3 font-pixel text-2xs text-theme-muted tracking-label">
              Enabled providers
            </p>
            <div className="flex flex-wrap gap-2">
              {room.activeSources?.map((provider) => {
                const enabled = room.settings.enabledSources.includes(provider);
                const nextSources = enabled
                  ? room.settings.enabledSources.filter(
                      (source) => source !== provider,
                    )
                  : [...room.settings.enabledSources, provider];
                return (
                  <fetcher.Form key={provider} method="post">
                    <input type="hidden" name="intent" value="updateSources" />
                    <input type="hidden" name="roomId" value={room.id} />
                    {nextSources.map((source) => (
                      <input
                        key={source}
                        type="hidden"
                        name="enabledSources"
                        value={source}
                      />
                    ))}
                    <Button
                      type="submit"
                      variant={enabled ? 'tertiary-active' : 'tertiary'}
                    >
                      <ProviderIcon
                        className="h-4 w-4"
                        provider={
                          provider as 'soundcloud' | 'spotify' | 'youtube'
                        }
                      />
                      {provider}
                    </Button>
                  </fetcher.Form>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
