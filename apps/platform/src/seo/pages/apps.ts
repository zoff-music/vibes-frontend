import type { ProductPage } from '../productPages';

export const page: ProductPage = {
  slug: 'apps',
  label: 'Apps & devices',
  title: 'Zoff Apps for iOS, Android & Android TV',
  description:
    'Get Zoff for iOS and Android, play on Android TV or Chromecast, and listen in your browser. One shared queue across your devices. Free, no account needed.',
  heading: 'Same room.',
  accent: 'Any screen.',
  introduction:
    'Pocket, desktop or living room. Bring your music with you, or leave the sound on the big screen and take the controls.',
  actionLabel: 'Open Zoff in your browser',
  sections: [
    {
      title: 'Listen on your own device.',
      body: 'iPhone, iPad, Android or a browser. Open the same room and listen together. Search, add and vote from whichever screen you have.',
    },
    {
      title: 'Fill the room, not every speaker.',
      body: 'Play on a computer, Android TV or Chromecast. Your friends can still add songs. Pair your phone as a remote when you want to control that specific player.',
    },
    {
      title: 'How do I pair a remote?',
      body: 'On the player, choose Enable Remote. Scan its QR code on your phone, or enter its Remote ID and pairing code. Play, pause, skip and seek now control that player, without starting a second audio stream.',
    },
    {
      title: 'How do I listen on TV?',
      body: 'Open Zoff on Android TV and enter your room name, or choose a Chromecast with the Cast button in a supported browser or app. Use your phone to add songs and vote.',
    },
    {
      title: 'Do my friends need the same app?',
      body: 'No. iOS, Android and browser sessions can all join the same room. Everyone gets the same queue. No account is required.',
    },
    {
      title: 'Does pairing give me admin access?',
      body: 'No. A remote controls its paired player. Room permissions still decide who may add songs or skip, and admin access still uses the room’s password.',
    },
  ],
};
