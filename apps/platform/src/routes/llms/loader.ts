import { siteUrl } from '../../seo/metadata';

export function loader() {
  return new Response(
    [
      '# Zoff: Shared Music Queue',
      '',
      '> Zoff is a free shared music queue for listening to music together. No account is required.',
      '',
      'Create a room, share its link, add supported YouTube or SoundCloud tracks, and vote on what plays next. Each room has its own playback and permission settings. Provider availability and playback restrictions still apply.',
      '',
      '## Get started',
      '',
      `- [Zoff](${siteUrl}/): Shared music rooms and live rooms.`,
      `- [Create a room](${siteUrl}/rooms/create): Configure a new music room.`,
      `- [Explore rooms](${siteUrl}/rooms/explore): Browse and search public rooms.`,
      '',
      '## Product guides',
      '',
      `- [Listen together](${siteUrl}/discovery/listening): Shared listening and room chat.`,
      `- [Shared queue](${siteUrl}/discovery/queue): Collaborative queues and playlist generation.`,
      `- [Room settings](${siteUrl}/discovery/rooms): Playback modes and room controls.`,
      `- [Apps](${siteUrl}/discovery/apps): Mobile and TV apps.`,
      '',
      '## Policies',
      '',
      `- [Privacy policy](${siteUrl}/privacy-policy): Data handling and privacy.`,
      `- [Terms of service](${siteUrl}/terms-of-service): Rules for using Zoff.`,
      `- [Security](${siteUrl}/security): Security information and reporting.`,
      '',
      'This file is a navigation guide, not a grant of permission to access private rooms or user data. It does not replace the policies above or robots.txt.',
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
