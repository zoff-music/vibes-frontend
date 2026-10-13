import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'watching',
  label: 'Watch together',
  title: 'Watch Together Online | Shared Video Rooms | Zoff',
  description:
    'Watch together with a shared YouTube queue, synchronized playback and room chat. Create a free Zoff Watch room without an account.',
  heading: 'Far apart. Same front row.',
  introduction:
    'The plan is simple: one link, one shared moment. A new home for watching together, with the familiar feel of Zoff.',
  actionLabel: 'Explore Watch',
  sections: [
    {
      title: 'Meet at the same moment',
      body: 'Watch is designed around a shared playback timeline. Join the room on your own screen and follow along with your friends, without a countdown in another app.',
    },
    {
      title: 'Keep the conversation close',
      body: 'A chat beside the video makes space for the running commentary. Want to focus on the film? Hide chat on your device without changing anyone else’s view.',
    },
    {
      title: 'How do I start?',
      body: 'Choose Watch, name your room and share its link. Search YouTube, paste a video or import a playlist. Watch rooms keep their type, so create a separate Music room when you want a music-only queue.',
    },
    {
      title: 'Will every YouTube video work?',
      body: 'Provider rules still apply. A video must allow embedded playback and may be restricted by region or age. Watch is not a way around YouTube’s availability or player requirements.',
    },
  ],
};
