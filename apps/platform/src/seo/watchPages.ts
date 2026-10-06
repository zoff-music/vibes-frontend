import type { ProductPage } from './productPages';

export const watchPages: ProductPage[] = [
  {
    slug: 'watch-together',
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
  },
  {
    slug: 'watch-party',
    label: 'Watch parties',
    title: 'Watch Parties | Watch Videos with Friends | Zoff',
    description:
      'Start a free watch party on Zoff. Bring friends, collect YouTube videos, chat and vote on what to watch next.',
    heading: 'Your people. Your programme.',
    introduction:
      'Short films. Rabbit holes. That one video everyone has to see. Turn a pile of links into a night together.',
    actionLabel: 'Plan a watch night',
    sections: [
      {
        title: 'Pass the link around',
        body: 'A room link brings everyone to the same queue. No account is needed, and each room has its own permissions for adding videos and controlling playback.',
      },
      {
        title: 'Give the night a direction',
        body: 'Let everyone contribute, or let a host curate the lineup. The aim is a queue that feels shared without interrupting the video every time somebody finds something new.',
      },
      {
        title: 'One screen or several?',
        body: 'For friends on a sofa, use Cinema mode on the main screen and add videos from your phone. For friends elsewhere, each person follows the room on their own device.',
      },
      {
        title: 'Which videos can we add?',
        body: 'Watch supports YouTube videos across categories, including longer videos. Live streams, upcoming broadcasts, made-for-kids videos and videos that disable embedding are excluded. Age and country restrictions may still affect playback.',
      },
    ],
  },
  {
    slug: 'watch-queue',
    label: 'A shared video queue',
    title: 'Shared Video Queue | Collaborative Watch Playlists | Zoff',
    description:
      'Build a shared video queue for a night of short films, discoveries and YouTube videos. Add together, vote and keep watching with Zoff.',
    heading: 'Less link juggling. More watching.',
    introduction:
      'Collect everyone’s finds in one place. Decide what comes next without losing what is playing now.',
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
  },
];
