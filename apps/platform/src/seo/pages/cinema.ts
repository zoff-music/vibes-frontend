import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'cinema',
  label: 'Watch parties',
  title: 'YouTube Watch Party | Host a Video Night with Friends | Zoff',
  description:
    'Start a free watch party on Zoff. Bring friends, collect YouTube videos, chat and vote on what to watch next.',
  heading: 'Host a YouTube watch party.',
  introduction:
    'Bring your friends to a free YouTube watch party with a shared queue, synchronized playback and chat. Plan a night of short films, documentaries or everyone’s favourite videos, whether you are together or miles apart.',
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
