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
        title: 'Send the room link',
        body: 'Copy the room’s URL into your group chat. Friends open it in a browser or the Zoff app. Nobody needs to register, and you can keep using your usual chat or call while you listen.',
      },
      {
        title: 'Start playback on each device',
        body: 'In server mode, everyone follows the same playback position and the next song starts automatically. Each device plays its own YouTube or SoundCloud audio. Tap Play if your browser is waiting for permission to start.',
      },
      {
        title: 'Can everyone choose songs?',
        body: 'Yes, unless the room has Admins Only Add enabled. Search for a track or paste its link, then vote for songs you want to hear sooner. Everyone sees the queue update.',
      },
      {
        title: 'Why won’t a track play for someone?',
        body: 'YouTube and SoundCloud decide where their tracks can play. A song may work for one friend but be unavailable in another country. Try a different upload or another song in the queue.',
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
      'Add the songs you want to hear, then see what your friends bring. Import a playlist or describe a mood and let AI find the first songs.',
    sections: [
      {
        title: 'Find a song',
        body: 'Use the room’s search to find a YouTube or SoundCloud track, or paste its link. Add a result to put it in the queue. Only the providers enabled in that room appear in search.',
      },
      {
        title: 'Song votes and skip votes',
        body: 'Vote on a queued song to move it up. Skipping affects the song playing now. In server mode, Democratic Skip makes that a group decision; Admins Only Skip limits it to room admins.',
      },
      {
        title: 'Import a playlist',
        body: 'Paste a YouTube or SoundCloud playlist link into search. Import it to add the tracks without stopping playback. If imports are disabled, a room admin can turn on Playlist Import in room settings.',
      },
      {
        title: 'Keep or remove played songs',
        body: 'Turn on Remove Played to take songs out of the queue after they finish. Leave it off to keep them in rotation. Allow Duplicates controls whether the same track can be added more than once.',
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
      'Choose who can add songs, who can skip, and whether playback runs automatically. Share the room link or embed the player on your website.',
    sections: [
      {
        title: 'Create and share',
        body: 'Choose a room name and the music sources: YouTube, SoundCloud, or both. Add an admin password if you want to protect the settings, then send friends the room link. They won’t need that password to listen.',
      },
      {
        title: 'Automatic playback or a host',
        body: 'Choose Server Mode for a queue that keeps playing when you leave. Choose Host Mode when one person should lead playback. The host controls play and pause; skipping also follows the room’s admin permissions.',
      },
      {
        title: 'Public or unlisted',
        body: 'Enable Public Room to appear on the homepage while people are listening. This requires an admin password. With Public Room off, you share the link yourself. An unlisted room is still open to anyone who knows its link or name.',
      },
      {
        title: 'Give someone admin access',
        body: 'Share the room’s admin password with the people who should manage it. They enter it in room settings to change permissions and queue options. Other listeners can keep using the room without admin access.',
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
        body: 'Install Zoff from the App Store and open a room by name. You can listen, search for songs and vote from your iPhone or iPad. Pair the app as a remote when you want the sound to stay on another player.',
      },
      {
        title: 'Android phones and tablets',
        body: 'Install Zoff from Google Play to open the same rooms on Android. Add songs and vote with friends, or pair your phone with another player to control its playback without a second source of audio.',
      },
      {
        title: 'Android TV and casting',
        body: 'Open Zoff on Android TV and join your room, or use the Cast button in a supported browser or app to choose a Chromecast. Keep the room open on your phone to search, add songs and vote.',
      },
      {
        title: 'Pair your phone as a remote',
        body: 'On the device playing music, open remote control and choose Enable Remote. Scan its QR code, or enter its Remote ID and pairing code on your phone. Once paired, play, pause, skip and seek all control that player.',
      },
      {
        title: 'No download needed on the web',
        body: 'Open zoff.me, enter a room name and join. The browser has the shared queue, voting and room settings too. You can use it alongside friends on the mobile apps.',
      },
    ],
  },
];
