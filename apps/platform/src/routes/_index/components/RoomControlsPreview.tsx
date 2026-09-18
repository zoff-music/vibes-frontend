import {
  ArrowRightIcon,
  Button,
  SegmentedToggle,
  SettingsIcon,
  SoundCloudIcon,
  YouTubeIcon,
} from '@vibes/ui/web';
import { useState } from 'react';
import { Link } from 'react-router';

const controls = [
  {
    key: 'adminsOnly',
    label: 'Admins Only Add',
    description: 'Only admins add songs',
    on: 'Only admins can add songs.',
    off: 'Everyone can add songs.',
  },
  {
    key: 'adminsSkip',
    label: 'Admins Only Skip',
    description: 'Only room admins can skip songs',
    on: 'Only admins can skip songs.',
    off: 'Listeners can skip, following the room’s voting setting.',
  },
  {
    key: 'democraticSkip',
    label: 'Democratic Skip',
    description: 'Require votes',
    on: 'Skipping takes a group vote.',
    off: 'Skipping does not require a group vote.',
  },
  {
    key: 'duplicates',
    label: 'Allow Duplicates',
    description: 'Same song multiple times',
    on: 'The same song can appear more than once.',
    off: 'Songs already in the queue cannot be added again.',
  },
  {
    key: 'removePlayed',
    label: 'Remove Played',
    description: 'Removed after play',
    on: 'Played songs leave the queue.',
    off: 'Played songs stay in rotation.',
  },
  {
    key: 'playlistImport',
    label: 'Playlist Import',
    description: 'Allow adding playlists from links',
    on: 'Listeners with permission to add songs can import playlists.',
    off: 'Songs are added individually.',
  },
] as const;

export function RoomControlsPreview() {
  const [options, setOptions] = useState({
    adminsOnly: false,
    adminsSkip: false,
    democraticSkip: true,
    duplicates: false,
    removePlayed: false,
    playlistImport: true,
  });
  const [sources, setSources] = useState({ youtube: true, soundcloud: true });
  const [feedback, setFeedback] = useState(
    'Everyone can add songs. Skipping takes a group vote.',
  );

  return (
    <section
      aria-labelledby="room-controls-heading"
      className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-5 lg:gap-20"
    >
      <div className="lg:order-2 lg:col-span-2">
        <p className="font-pixel text-primary text-xs tracking-label">
          ROOM CONTROLS
        </p>
        <h2
          id="room-controls-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Your room.
          <br />
          Your settings.
        </h2>
        <p className="mt-5 max-w-sm text-theme-muted leading-relaxed">
          Choose who can add and skip songs, which sources to use, and what
          stays in the queue. No accounts to manage.
        </p>
        <Link
          to="/discovery/rooms"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          More room settings{' '}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0 lg:order-1 lg:col-span-3">
        <div className="rounded-3xl border border-theme bg-theme p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-theme border-b pb-5">
            <span className="flex items-center gap-3 font-pixel text-sm text-theme">
              <SettingsIcon
                aria-hidden="true"
                className="h-5 w-5 text-primary"
              />
              Room Control
            </span>
            <span className="text-theme-subtle text-xs">Try the settings</span>
          </div>
          <div className="space-y-5">
            {controls.map((control) => (
              <SegmentedToggle
                key={control.key}
                label={control.label}
                description={control.description}
                variant="plain-full"
                checked={options[control.key]}
                onChange={(enabled) => {
                  setOptions((previous) => ({
                    ...previous,
                    [control.key]: enabled,
                  }));
                  setFeedback(enabled ? control.on : control.off);
                }}
              />
            ))}
          </div>
          <fieldset className="mt-6 border-theme border-t pt-4">
            <legend className="px-2 font-pixel text-theme-muted text-xs">
              Sources
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={sources.youtube ? 'red' : 'tertiary'}
                aria-pressed={sources.youtube}
                onClick={() =>
                  setSources((previous) => ({
                    ...previous,
                    youtube: !previous.youtube,
                  }))
                }
                className="gap-2 px-3 text-sm"
              >
                <YouTubeIcon className="h-5 w-5" />
                YouTube
              </Button>
              <Button
                variant={sources.soundcloud ? 'orange' : 'tertiary'}
                aria-pressed={sources.soundcloud}
                onClick={() =>
                  setSources((previous) => ({
                    ...previous,
                    soundcloud: !previous.soundcloud,
                  }))
                }
                className="gap-2 px-3 text-sm"
              >
                <SoundCloudIcon className="h-5 w-5" />
                SoundCloud
              </Button>
            </div>
          </fieldset>
          <p
            aria-live="polite"
            className="mt-5 min-h-10 text-sm text-theme-muted"
          >
            {feedback}
          </p>
        </div>
        <p className="mt-4 text-center text-theme-subtle text-xs">
          A room password protects admin controls.
        </p>
      </div>
    </section>
  );
}
