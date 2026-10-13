import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'listening',
  label: 'Listen together',
  title: 'Listen to Music Together Online | Zoff',
  description:
    'Listen to music with friends online. Start a free Zoff room, share the link and build a queue together with synchronized playback and song voting.',
  heading: 'A little closer.',
  accent: 'One song at a time.',
  introduction:
    'Different places, the same soundtrack. Share a room link and listen to music together, wherever the evening takes you.',
  actionLabel: 'Start listening together',
  sections: [
    {
      title: 'One link. Everyone’s invited.',
      body: 'Choose a room name, add a few songs and share the link. Friends join in their browser or the app. No accounts, no sign-up.',
    },
    {
      title: 'Pick up where the room is.',
      body: 'Each device follows the room’s playback position. Come and go without restarting the song. If your browser asks, tap Play to begin.',
    },
    {
      title: 'Can everyone add songs?',
      body: 'Yes, unless the room has Admins Only Add enabled. Search YouTube or SoundCloud, paste a link, and vote for the songs you want to hear next.',
    },
    {
      title: 'What if we’re in the same room?',
      body: 'Use one device for sound. Everyone else can add songs and vote, or pair a phone as a remote. Friends in different places can each play the room on their own device.',
    },
    {
      title: 'What happens when someone leaves?',
      body: 'In Server Mode, the room’s timeline keeps going. Host Mode follows one host instead. When that host leaves, another participant takes over.',
    },
    {
      title: 'Why can’t everyone play the same track?',
      body: 'YouTube and SoundCloud control availability. A track may be restricted by country or require a provider sign-in. Try another upload if someone cannot play it.',
    },
  ],
};
