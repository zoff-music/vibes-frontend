import type { ProductPage } from './productPages';

// Frontend concepts only. These guides must not claim an available Watch service.
export const watchPages: ProductPage[] = [
  {
    slug: 'watch-together',
    label: 'Watch together',
    title: 'Watch YouTube Together | Zoff Design Preview',
    description:
      'Explore the Zoff Watch concept: a shared YouTube queue, synchronized playback and a place for your people.',
    heading: 'Far apart. Same front row.',
    introduction:
      'The plan is simple: one link, one shared moment. A new home for watching YouTube together, with the familiar feel of Zoff.',
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
        title: 'What can I try now?',
        body: 'This is an interactive design preview. The scenes and participants are illustrative; Watch creation, video generation and new playback behavior are not connected to the backend.',
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
    title: 'YouTube Watch Parties | Zoff Design Preview',
    description:
      'A preview of watch parties on Zoff: bring friends, collect videos and choose the next thing together.',
    heading: 'Your people. Your programme.',
    introduction:
      'Short films. Rabbit holes. That one video everyone has to see. Turn a pile of links into a night together.',
    actionLabel: 'Plan a watch night',
    sections: [
      {
        title: 'Pass the link around',
        body: 'The Watch concept keeps Zoff’s account-free approach. A room link brings everyone to the same queue, with room-specific permissions rather than a new account to manage.',
      },
      {
        title: 'Give the night a direction',
        body: 'Let everyone contribute, or let a host curate the lineup. The aim is a queue that feels shared without interrupting the video every time somebody finds something new.',
      },
      {
        title: 'One screen or several?',
        body: 'For friends on a sofa, the concept puts the film on the big screen and the queue within reach. For friends elsewhere, each person follows the room on their own device.',
      },
      {
        title: 'Is Watch available?',
        body: 'Not in this preview. No real room is created and no requests are sent by the example controls. Existing Music rooms continue to work as before.',
      },
    ],
  },
  {
    slug: 'watch-queue',
    label: 'A shared video queue',
    title: 'Shared Video Queue | Zoff Design Preview',
    description:
      'Preview a shared video queue for Zoff Watch, with ideas for a night of short films, discoveries and YouTube videos.',
    heading: 'Less link juggling. More watching.',
    introduction:
      'Collect everyone’s finds in one place. Decide what comes next without losing what is playing now.',
    actionLabel: 'Try a Watch idea',
    sections: [
      {
        title: 'Build the lineup together',
        body: 'The Watch direction carries over Zoff’s shared queue and votes. Add a discovery, give a favourite a vote and see the next item without scrolling through an old group chat.',
      },
      {
        title: 'Start with a little curiosity',
        body: 'Watch-specific generation ideas could turn “a trip through the solar system” or “beautiful places after dark” into a starting lineup. The prompt controls here are local previews, not a connected AI service.',
      },
      {
        title: 'Does this change music generation?',
        body: 'No. Music keeps its current prompts, provider behavior and generation flow. The new Watch examples do not change the music-focused backend prompt.',
      },
      {
        title: 'What do the preview films represent?',
        body: 'They are original illustrative scenes, not videos fetched from YouTube or recommendations returned by AI. They demonstrate the visual direction and shared playback interaction.',
      },
    ],
  },
];
