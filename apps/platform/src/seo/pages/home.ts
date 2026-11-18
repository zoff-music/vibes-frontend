export interface HomeFeature {
  title: string;
  body: string;
  to: string;
}

export const musicFeatures: HomeFeature[] = [
  {
    title: 'Listen in sync',
    body: 'Everyone hears the same song at the same moment, on their own phone, computer or TV.',
    to: '/discovery/listening',
  },
  {
    title: 'A queue everyone shapes',
    body: 'Add from YouTube and SoundCloud or paste a playlist. Votes decide what plays next.',
    to: '/discovery/queue',
  },
  {
    title: 'AI playlists from an idea',
    body: 'Describe a mood or a genre and get a starting queue the room can change.',
    to: '/discovery/queue#ai-playlists',
  },
  {
    title: 'Your room, your rules',
    body: 'Choose who adds and who skips, keep playing songs or remove them, and pick a playback mode.',
    to: '/discovery/rooms',
  },
  {
    title: 'Chat with the room',
    body: 'Talk about the music and see every add, vote and skip as it happens.',
    to: '/discovery/listening#room-chat',
  },
  {
    title: 'Phones, TVs and Chromecast',
    body: 'Use the iOS and Android apps, Android TV or Chromecast, with your phone as the remote.',
    to: '/discovery/apps',
  },
];

export const watchFeatures: HomeFeature[] = [
  {
    title: 'Watch YouTube in sync',
    body: 'Everyone sees the same video at the same moment, on separate screens.',
    to: '/discovery/watching',
  },
  {
    title: 'A shared video queue',
    body: 'Friends add YouTube videos and vote on what plays next.',
    to: '/discovery/videos',
  },
  {
    title: 'Watch parties with chat',
    body: 'Plan a night of films or videos and keep the commentary in the room.',
    to: '/discovery/cinema',
  },
  {
    title: 'Party screen for the TV',
    body: 'Put the room on a big screen with a QR code everyone scans to join.',
    to: '/discovery/cinema#party-screen',
  },
  {
    title: 'AI watch ideas',
    body: 'Describe what you feel like watching and get a first lineup of videos.',
    to: '/discovery/videos#ai-playlists',
  },
  {
    title: 'Phones, TVs and Chromecast',
    body: 'Join from the apps or a browser, cast to a TV and control it from your phone.',
    to: '/discovery/apps',
  },
];
