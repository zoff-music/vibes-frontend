import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'queue',
  label: 'Shared music queue',
  title: 'Shared Music Queue & Collaborative Playlists | Zoff',
  description:
    'Build a shared music queue with friends. Add songs from YouTube and SoundCloud, vote on what plays next, import a playlist or start one with AI. Free, no account needed.',
  heading: 'Your taste.',
  accent: 'Their next favourite.',
  introduction:
    'A shared music queue everyone can shape. Bring a song, discover a new one, and vote your favourites to the top.',
  actionLabel: 'Start a shared queue',
  sections: [
    {
      title: 'Bring the songs you love.',
      body: 'Search YouTube and SoundCloud in the room, or paste a track or playlist link. Both providers share one queue.',
    },
    {
      title: 'Let the room choose next.',
      body: 'Song votes move favourites up the queue without interrupting the music. Skip votes are separate: they decide whether to move on from the current song.',
    },
    {
      title: 'Can I import a whole playlist?',
      body: 'Yes. Paste a YouTube or SoundCloud playlist link into search. If Playlist Import is disabled, a room admin can enable it. Unsupported or restricted items are skipped with a warning.',
    },
    {
      title: 'Do played songs stay in the queue?',
      body: 'That is up to the room. Remove Played takes finished songs out. Leave it off to keep them in rotation. Allow Duplicates is a separate setting.',
    },
    {
      title: 'Who can add or remove songs?',
      body: 'Everyone can add unless Admins Only Add is enabled. Room admins can remove items and set queue rules. These permissions apply only to that room.',
    },
    {
      title: 'Can I change an AI-generated playlist?',
      body: 'Always. It becomes an ordinary shared queue. Add your own songs, vote, or use the admin controls to remove suggestions. AI only gives you a starting point.',
    },
  ],
};
