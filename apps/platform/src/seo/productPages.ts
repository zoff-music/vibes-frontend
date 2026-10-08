export interface ProductSection {
  title: string;
  body: string;
  points?: string[];
}

export interface ProductPage {
  slug: string;
  label: string;
  title: string;
  description: string;
  heading: string;
  accent?: string;
  introduction: string;
  actionLabel: string;
  sections: ProductSection[];
}

export const productPages: ProductPage[] = [
  {
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
  },
  {
    slug: 'queue',
    label: 'Shared music queue',
    title: 'Shared Music Queue & Collaborative Playlists | Zoff',
    description:
      'Build a shared music queue with friends. Add songs from YouTube and SoundCloud, vote on what plays next, import a playlist or start one with AI. Free, no account needed.',
    heading: 'Your taste.',
    accent: 'Their next favourite.',
    introduction:
      'A shared music queue everyone can shape. Bring a song, discover a new one, and vote your favourites to the top.',
    actionLabel: 'Start a shared queue',
    sections: [
      {
        title: 'Bring the songs you love.',
        body: 'Search YouTube and SoundCloud in the room, or paste a track or playlist link. Both providers share one queue.',
      },
      {
        title: 'Let the room choose next.',
        body: 'Song votes move favourites up the queue without interrupting the music. Skip votes are separate: they decide whether to move on from the current song.',
      },
      {
        title: 'Can I import a whole playlist?',
        body: 'Yes. Paste a YouTube or SoundCloud playlist link into search. If Playlist Import is disabled, a room admin can enable it. Unsupported or restricted items are skipped with a warning.',
      },
      {
        title: 'Do played songs stay in the queue?',
        body: 'That is up to the room. Remove Played takes finished songs out. Leave it off to keep them in rotation. Allow Duplicates is a separate setting.',
      },
      {
        title: 'Who can add or remove songs?',
        body: 'Everyone can add unless Admins Only Add is enabled. Room admins can remove items and set queue rules. These permissions apply only to that room.',
      },
      {
        title: 'Can I change an AI-generated playlist?',
        body: 'Always. It becomes an ordinary shared queue. Add your own songs, vote, or use the admin controls to remove suggestions. AI only gives you a starting point.',
      },
    ],
  },
  {
    slug: 'rooms',
    label: 'Your room',
    title: 'Create a Free Listening Room | Zoff',
    description:
      'Create a free music room with your own playback and queue rules. Choose who adds and skips, share the link or embed your player. No account needed.',
    heading: 'Your people.',
    accent: 'Your house rules.',
    introduction:
      'An open queue for your friends, or a soundtrack you curate. A few simple settings make the room yours.',
    actionLabel: 'Make a room',
    sections: [
      {
        title: 'Make it yours, then share it.',
        body: 'Choose a name, your music providers and an admin password. Send the room link. Friends do not need the password to listen.',
      },
      {
        title: 'Keep control of the controls.',
        body: 'Your admin password protects settings and queue management. Let everyone add and skip, or reserve those actions for admins. Other rooms stay unchanged.',
      },
      {
        title: 'Public or unlisted?',
        body: 'Public rooms appear in Browse; active ones can appear on the homepage. This requires an admin password. Unlisted rooms stay out of Browse, but anyone with their link or name can still join.',
      },
      {
        title: 'Can someone else help manage the room?',
        body: 'Share the admin password with them. They enter it in room settings. Admin access is separate from hosting playback or pairing a remote.',
      },
      {
        title: 'How does vote-to-skip work?',
        body: 'In Server Mode, enable Democratic Skip to make skipping a group decision. The room moves on when the vote threshold is reached. Admins Only Skip instead reserves skipping for admins.',
      },
      {
        title: 'Does each room have its own settings?',
        body: 'Yes. Providers, playback mode, queue rules and admin access belong to the room. Your display name, theme and Chat on/off preference belong to your device.',
      },
    ],
  },
  {
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
  },
];
