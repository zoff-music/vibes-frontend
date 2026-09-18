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
        body: 'Share your room link. Friends can join in a browser or the mobile app without an account. A display name lets others see who added each song.',
      },
      {
        title: 'Stay on the same track',
        body: 'Server mode synchronizes playback and advances the queue automatically. Each device plays through YouTube or SoundCloud. Your browser may need a tap to start audio; some tracks may be unavailable in your region.',
      },
      {
        title: 'Add songs and vote',
        body: 'Search YouTube or SoundCloud, or paste a song link. Vote to move a track up the queue. Room admins choose who can add songs and skip.',
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
        body: 'A song vote moves a track up the queue. Skip votes decide when to move on. Admins can require a group vote to skip or keep skipping to themselves.',
      },
      {
        title: 'Start with a playlist',
        body: 'Paste a supported playlist link to add its songs. Import progress shows the additions while music keeps playing. The room must allow playlist imports and you must have permission to add songs.',
      },
      {
        title: 'Keep or remove played songs',
        body: 'Leave played songs in rotation or remove them after playback. You can also prevent duplicates and limit additions to admins.',
      },
    ],
  },
  {
    slug: 'rooms',
    label: 'Rooms',
    title: 'Create a Free Listening Room | Zoff',
    description:
      'Create a free room for listening together. Set playback, voting and admin controls, then share the link. No account or registration needed.',
    heading: 'Set up your room.',
    actionLabel: 'Configure a room',
    introduction:
      'Choose who can add songs, who can skip, and whether playback runs automatically. Every room keeps its own settings.',
    sections: [
      {
        title: 'Create and share',
        body: 'Choose a room name and enable YouTube, SoundCloud, or both. Share the link to let people join. Creating and joining rooms is free.',
      },
      {
        title: 'Automatic playback or a host',
        body: 'Server mode runs the queue automatically, even when the person who created the room leaves. In host mode, one host controls play, pause and skipping.',
      },
      {
        title: 'Public or unlisted',
        body: 'A public room can appear under Live now while people are listening. Leave it off the public list when you only want to share the link yourself. Anyone with an unlisted room’s link or name can still join.',
      },
      {
        title: 'Admin settings',
        body: 'Set an admin password to protect the room’s settings. It gives access to playback permissions and queue controls; guests can still join without it.',
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
        body: 'Open zoff.me in a browser to create or join a room. You get the shared queue, voting, room controls and playback without installing an app.',
      },
    ],
  },
];
