export interface ProductSection {
  title: string;
  body: string;
}

export interface ProductPage {
  slug: string;
  label: string;
  title: string;
  description: string;
  heading: string;
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
    heading: 'Listen with friends, wherever they are.',
    actionLabel: 'Start listening',
    introduction:
      'Share a room link and listen to the same music while you chat, work or play. Everyone can add songs to the queue.',
    sections: [
      {
        title: 'Invite your friends',
        body: 'Create a room and share its link. Friends can join in a browser without creating an account, or use the mobile app. Pick a display name so people can see who brought each song to the queue.',
      },
      {
        title: 'Stay on the same track',
        body: 'Server mode keeps the room on a shared playback timeline and moves through the queue automatically. Each listener plays music through the supported provider’s player. A browser may need a tap to start audio, and track availability can vary by provider or region.',
      },
      {
        title: 'Add songs and vote',
        body: 'Search the enabled music providers or paste a song link, then add your choice to the queue. Vote for the songs you want to hear next. Room settings decide who can add songs and skip.',
      },
      {
        title: 'Use your usual group chat',
        body: 'Send the room link in your group chat or Discord call. Each person opens Zoff on their own device. There’s no chat bot to install.',
      },
    ],
  },
  {
    slug: 'queue',
    label: 'Shared music queue',
    title: 'Shared Music Queue & Collaborative Playlists | Zoff',
    description:
      'Build a shared music queue with friends. Add tracks, vote on what plays next or generate a playlist from a mood with AI. Free, no account needed.',
    heading: 'Build a queue together.',
    actionLabel: 'Build a shared queue',
    introduction:
      'Add the songs you want to hear, then see what your friends bring. You can also import a playlist or use a playlist idea to get started.',
    sections: [
      {
        title: 'Find a song',
        body: 'Search YouTube or SoundCloud, or paste a track link. Songs go straight into the room’s queue. The room’s settings decide which providers are enabled and who can add music.',
      },
      {
        title: 'Let the room vote',
        body: 'Song votes help your group shape the queue. For skips, room admins can choose democratic voting or restrict skipping to admins. A song vote moves a track up the queue; skip votes decide when to move on.',
      },
      {
        title: 'Start with a playlist',
        body: 'When playlist import is enabled and you have the required room permissions, paste a supported playlist link to bring an existing selection into the room. Import progress lets you follow the additions while the queue remains available for listening.',
      },
      {
        title: 'Keep or remove played songs',
        body: 'Keep played tracks in rotation for a repeating soundtrack, or enable removal after play for a queue that moves on. Duplicate-song and admin-only addition settings help tailor the queue to a small group, a shared workspace or a larger gathering.',
      },
    ],
  },
  {
    slug: 'rooms',
    label: 'Rooms',
    title: 'Create an Online Room | Zoff',
    description:
      'Create a free online room. No Zoff account needed. Set playback, voting and admin controls for each room, then share the link with friends.',
    heading: 'Set up your room.',
    actionLabel: 'Configure a room',
    introduction:
      'Choose who can add songs, who can skip, and whether playback runs automatically. Every room keeps its own settings.',
    sections: [
      {
        title: 'Create and share',
        body: 'Create and join rooms for free, without ever making a Zoff account. Choose a room name and music sources, then share the link. Each room keeps its own settings.',
      },
      {
        title: 'Automatic playback or a host',
        body: 'In server mode, the room keeps a shared playback timeline and advances automatically. In host mode, the host directs playback. Use server mode for an ongoing radio room, or host mode when someone needs the controls.',
      },
      {
        title: 'Public or unlisted',
        body: 'A public room can appear under Live now while people are listening. Leave it off the public list when you only want to share the link yourself. Anyone with an unlisted room’s link or name can still join.',
      },
      {
        title: 'Admin settings',
        body: 'Each room has its own settings and optional admin password. Choose who may add or skip songs, whether skipping needs votes, and whether played tracks stay in the queue. The password protects that room’s admin controls, not an account or guest entry.',
      },
    ],
  },
  {
    slug: 'apps',
    label: 'Apps & devices',
    title: 'Zoff Apps for iOS, Android & Android TV',
    description:
      'Get Zoff for iOS and Android, explore Android TV, or listen in your browser. Join shared rooms, add songs and control your player from your phone.',
    heading: 'From your phone to your TV.',
    actionLabel: 'Use Zoff in your browser',
    introduction:
      'Listen in your browser, on iOS or Android, or play the room on your TV. Use your phone to add songs or control another player.',
    sections: [
      {
        title: 'iPhone and iPad',
        body: 'Get Zoff from the App Store to join rooms, add songs, vote and use your device as a paired remote. The app is available for iPhone and iPad.',
      },
      {
        title: 'Android phones and tablets',
        body: 'Find Zoff on Google Play. Open a room by name, build the queue with friends and choose whether this device plays music or only participates in controlling the room.',
      },
      {
        title: 'Android TV and casting',
        body: 'Open Zoff on Android TV, or use the Cast button in a supported browser or app to connect to a compatible Chromecast. Friends can join the same room on their phones to add songs and vote.',
      },
      {
        title: 'Pair your phone as a remote',
        body: 'Enable remote control on the player connected to your speakers. Scan its QR code or enter its pairing code in the mobile app. Your phone controls that player without playing audio or joining as another listener.',
      },
      {
        title: 'No download needed on the web',
        body: 'Create or join a room at zoff.me or in the apps. Zoff is always free and never requires a Zoff account. Music availability and playback restrictions depend on the enabled providers and their official players.',
      },
    ],
  },
];
