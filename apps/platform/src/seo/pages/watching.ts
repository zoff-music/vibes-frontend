import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'watching',
  label: 'Watch together',
  title: 'How to Watch YouTube Together Online | Zoff',
  description:
    'Learn how to watch YouTube with friends in sync: create a Zoff room, share the link, add videos and start watching. Free, with no account or extension.',
  heading: 'How to watch YouTube together.',
  introduction:
    'Zoff brings YouTube videos, synchronized playback and chat into one shared room. Friends can join from different places and watch on their own screens, without installing a browser extension.',
  actionLabel: 'Start watching together',
  sections: [
    {
      title: 'Create a room and invite your friends',
      body: 'Choose Watch, enter a room name and start the room. Copy its link and send it to your friends. Everyone opens the same link in their browser; no Zoff account is required.',
    },
    {
      title: 'Add a video and watch in sync',
      body: 'Open Add, search YouTube or paste a video link, and add it to the shared queue. Each friend may need to press Click to play to enable sound. The room shares its current video and playback position, so you can follow along without counting down in another app.',
    },
    {
      title: 'Can we watch together on phones and computers?',
      body: 'Yes. Open the same Watch room link in a supported mobile or desktop browser. Keep the room open while watching. Browser autoplay and background restrictions still apply, so returning to a backgrounded tab may require another tap to resume.',
    },
    {
      title: 'Who controls playback?',
      body: 'In Host mode, the host controls play, pause, seeking and skipping. In Server mode, the room advances through its queue automatically. Room permissions determine who can add videos and skip; friends can also vote on queued videos.',
    },
    {
      title: 'Is watching together free?',
      body: 'Zoff is free and does not require an account or browser extension. Videos play through the official YouTube embed, not a shared copy of someone’s screen. YouTube’s ads, availability and playback restrictions still apply to each viewer.',
    },
    {
      title: 'Will every YouTube video work?',
      body: 'Provider rules still apply. A video must allow embedded playback and may be restricted by region or age. Watch is not a way around YouTube’s availability or player requirements.',
    },
    {
      title: 'Can I watch Netflix or other streaming services here?',
      body: 'No. Watch rooms support YouTube videos, not Netflix, Disney+, Prime Video or screen sharing. Music rooms separately support YouTube and SoundCloud for shared listening.',
    },
  ],
};
