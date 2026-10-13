import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'cinema',
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
};
