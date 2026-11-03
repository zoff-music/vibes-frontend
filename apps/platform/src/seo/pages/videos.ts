import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'videos',
  label: 'A shared video queue',
  title: 'Shared YouTube Queue | Add Videos and Vote Together | Zoff',
  description:
    'Build a shared video queue for a night of short films, discoveries and YouTube videos. Add together, vote and keep watching with Zoff.',
  heading: 'Build a shared YouTube queue.',
  introduction:
    'Collect YouTube videos in one room queue, let friends add their finds and vote on what plays next. Watch the queue together without passing links around or interrupting the current video.',
  actionLabel: 'Try a Watch idea',
  sections: [
    {
      title: 'Build the lineup together',
      body: 'Add a discovery, give a favourite a vote and see the next item without scrolling through an old group chat. Room controls let you decide who can add or skip videos.',
    },
    {
      title: 'Start with a little curiosity',
      body: 'Describe what you want to watch, such as “a trip through the solar system” or “beautiful places after dark”. Zoff uses AI to suggest a lineup and checks the videos through YouTube. Review the results before settling in; generated suggestions can miss the mark.',
    },
    {
      title: 'Does this change music generation?',
      body: 'No. Music generates music playlists; Watch looks for videos around your idea. Inside a room, its fixed type determines which generation flow and providers are available.',
    },
    {
      title: 'What do the preview films represent?',
      body: 'They are original illustrative scenes, not videos fetched from YouTube or recommendations returned by AI. They demonstrate the visual direction and shared playback interaction.',
    },
  ],
};
