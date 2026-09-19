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
        points: [
          'Use the same room name on every device. A different name opens a different queue.',
          'Add a few songs before sharing the link so friends have something to join.',
          'Keep the link for next time; you don’t need to make a new room for each session.',
        ],
      },
      {
        title: 'Start playback on each device',
        body: 'In server mode, everyone follows the same playback position and the next song starts automatically. Each device plays its own YouTube or SoundCloud audio. Tap Play if your browser is waiting for permission to start.',
        points: [
          'Each listener chooses their own volume. Turning yours down won’t change anyone else’s.',
          'For people in the same room, use one device for sound. The others can still add songs and vote.',
          'For friends in different places, play the room on each device so everyone can hear it.',
        ],
      },
      {
        title: 'Can everyone choose songs?',
        body: 'Yes, unless the room has Admins Only Add enabled. Search for a track or paste its link, then vote for songs you want to hear sooner. Everyone sees the queue update.',
      },
      {
        title: 'Why won’t a track play for someone?',
        body: 'YouTube and SoundCloud decide where their tracks can play. A song may work for one friend but be unavailable in another country. Try a different upload or another song in the queue.',
      },
      {
        title: 'Listening together or using a remote?',
        body: 'Join the room normally when you want music on your own device. Pair as a remote when another device should make the sound. A remote controls that player; it does not start a second copy of the audio on your phone.',
      },
      {
        title: 'What happens when the person who started the room leaves?',
        body: 'In Server Mode, the playback timeline belongs to the room and the queue continues without its creator. Host Mode works differently: it follows one host’s playback. Use Server Mode for a group that wants to come and go without handing over the controls.',
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
        points: [
          'Try the artist and song title together when a short search returns too many results.',
          'Check the title, artist and duration before adding a result, especially for mixes or live versions.',
          'A room admin can restrict adding songs. Voting on the existing queue is a separate action.',
        ],
      },
      {
        title: 'Song votes and skip votes',
        body: 'Vote on a queued song to move it up. Skipping affects the song playing now. In server mode, Democratic Skip makes that a group decision; Admins Only Skip limits it to room admins.',
        points: [
          'A song vote changes the queue order; it doesn’t interrupt the current track.',
          'A skip vote applies to the current song. Playback moves on when the room’s threshold is met.',
          'The queue updates for everyone, so you can see what is coming next without refreshing.',
        ],
      },
      {
        title: 'Import a playlist',
        body: 'Paste a YouTube or SoundCloud playlist link into search. Import it to add the tracks without stopping playback. If imports are disabled, a room admin can turn on Playlist Import in room settings.',
      },
      {
        title: 'Keep or remove played songs',
        body: 'Turn on Remove Played to take songs out of the queue after they finish. Leave it off to keep them in rotation. Allow Duplicates controls whether the same track can be added more than once.',
      },
      {
        title: 'What happens after AI generates a playlist?',
        body: 'The suggestions become songs in an ordinary Zoff room. You can vote, add more tracks and use the room’s admin controls to remove ones you don’t want. Generation gives you a starting queue; it doesn’t lock you into a fixed playlist or keep choosing music for you.',
      },
      {
        title: 'Can I mix YouTube and SoundCloud?',
        body: 'Yes, when both sources are enabled for the room. Tracks from either provider share the same queue and voting. If a source is missing from search, check the room settings. Availability still depends on the provider and the listener’s location.',
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
        points: [
          'The room name is part of its link. Choose something your friends can type on a phone or TV.',
          'Use an admin password before restricting who can add songs or making the room public.',
          'Room permissions apply to that room. Changing them won’t affect another room you join.',
        ],
      },
      {
        title: 'Automatic playback or a host',
        body: 'Choose Server Mode for a queue that keeps playing when you leave. Choose Host Mode when one person should lead playback. The host controls play and pause; skipping also follows the room’s admin permissions.',
        points: [
          'Server Mode suits a shared queue where people can join and leave independently.',
          'Host Mode suits a session where one person decides when playback starts and pauses.',
          'For a speaker or TV controlled from a phone, pair a remote with the device playing the room.',
        ],
      },
      {
        title: 'Public or unlisted',
        body: 'Enable Public Room to appear on the homepage while people are listening. This requires an admin password. With Public Room off, you share the link yourself. An unlisted room is still open to anyone who knows its link or name.',
      },
      {
        title: 'Give someone admin access',
        body: 'Share the room’s admin password with the people who should manage it. They enter it in room settings to change permissions and queue options. Other listeners can keep using the room without admin access.',
      },
      {
        title: 'Keep the queue open, or choose the music yourself',
        body: 'Leave Admins Only Add off to let listeners contribute. Turn it on when you want a queue chosen by admins. Playlist Import lets people add a whole playlist from a link; disable it if you prefer songs added individually. These rules live inside the room, with no listener accounts to manage.',
      },
      {
        title: 'Set the rules for skipping and repeats',
        body: 'Admins Only Skip reserves skipping for admins. With that off, Democratic Skip lets listeners decide by voting. Remove Played takes finished songs out of the queue; leave it off for a queue that repeats. Allow Duplicates is separate: it decides whether a song can be added more than once.',
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
        title: 'Join from the device you have',
        body: 'Zoff is available for iPhone and iPad in the App Store, and Android phones and tablets on Google Play. You can also join in a browser. Open the same room name or link to share its queue across devices.',
        points: [
          'Search YouTube and SoundCloud, add tracks and vote from the mobile apps.',
          'Friends can mix iOS, Android and browser sessions in the same room.',
          'No account is needed to join. The room link is enough to get started.',
        ],
      },
      {
        title: 'Choose where the sound plays',
        body: 'Listen on your phone when you want your own audio, or let a TV, computer or cast device play the room. Pairing your phone as a remote keeps the controls close while the sound stays on that other player.',
        points: [
          'Use one audio source for people sharing a space, so nearby devices don’t play over each other.',
          'Remote controls include play, pause, skip and seeking within the current song.',
          'Joining the same room lets anyone contribute songs; pairing controls a specific player.',
        ],
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
      {
        title: 'Which controls need room admin access?',
        body: 'A paired remote controls its player. Room settings still decide who can add songs or skip, and admin access is handled separately with the room’s password. Pairing a phone does not make it an admin or change the permissions for other listeners.',
      },
    ],
  },
];
