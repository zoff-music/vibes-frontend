export interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
  guide?: { to: string; label: string };
}

export interface FaqTopic {
  id: string;
  title: string;
  summary: string;
  questions: FaqQuestion[];
}

export const faqTitle = 'Zoff FAQ | Listening and Watching Together | Zoff';
export const faqDescription =
  'Answers about Zoff: free shared music and YouTube rooms, the voting queue, room settings, apps, TVs, remotes and what plays where.';

export const faqTopics: FaqTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    summary: 'What Zoff is and how to bring people in.',
    questions: [
      {
        id: 'is-zoff-free',
        question: 'Is Zoff free?',
        answer:
          'Yes. Creating and joining rooms is free, and nobody needs an account. YouTube’s and SoundCloud’s own ads and availability rules still apply to what plays.',
      },
      {
        id: 'how-to-start',
        question: 'How do I start a room?',
        answer:
          'Type a room name on the homepage and choose Start a room, or open Create a room for more settings. Share the room’s link and friends join straight away.',
        guide: { to: '/rooms/create', label: 'Create a room' },
      },
      {
        id: 'friends-need-app',
        question: 'Do my friends need the app or an account?',
        answer:
          'No. Anyone can open the room link in a browser. The iOS and Android apps are optional, and every kind of device joins the same room and queue.',
        guide: { to: '/discovery/apps', label: 'Apps and devices' },
      },
      {
        id: 'music-or-watch',
        question: 'What is the difference between Music and Watch rooms?',
        answer:
          'Music rooms play songs from YouTube and SoundCloud. Watch rooms play YouTube videos, so everyone sees the same video at the same moment. A room keeps the type it was created with.',
        guide: { to: '/discovery/watching', label: 'Watching together' },
      },
      {
        id: 'join-late',
        question: 'What happens if I join late?',
        answer:
          'Your device picks up at the room’s current point in the song or video. If your browser asks, tap Play once to allow sound.',
        guide: { to: '/discovery/listening', label: 'Listening together' },
      },
    ],
  },
  {
    id: 'queue',
    title: 'The shared queue',
    summary: 'Adding, voting and what plays next.',
    questions: [
      {
        id: 'where-music-comes-from',
        question: 'Where does the music come from?',
        answer:
          'Songs and videos play from YouTube and SoundCloud through their official players. Zoff does not host or copy any media.',
      },
      {
        id: 'how-voting-works',
        question: 'How does voting work?',
        answer:
          'Anyone in the room can vote for queued songs. Votes move favourites up without interrupting what is playing, and the most voted song plays next for everyone.',
        guide: { to: '/discovery/queue', label: 'The shared queue' },
      },
      {
        id: 'import-playlist',
        question: 'Can I import a whole playlist?',
        answer:
          'Yes. Paste a YouTube or SoundCloud playlist link into search, check the preview and add everything at once. Unsupported or restricted items are skipped with a note.',
        guide: { to: '/discovery/queue', label: 'The shared queue' },
      },
      {
        id: 'ai-playlists',
        question: 'How do AI playlists work?',
        answer:
          'Describe a mood, genre or idea and Zoff suggests a starting queue, checked against the provider. It becomes an ordinary queue that everyone can add to, vote on and change.',
        guide: { to: '/discovery/queue#ai-playlists', label: 'AI playlists' },
      },
      {
        id: 'played-songs',
        question: 'Do played songs stay in the queue?',
        answer:
          'That is up to the room. Remove Played takes finished songs out; leave it off to keep them in rotation. Allow Duplicates is a separate setting.',
      },
      {
        id: 'track-unavailable',
        question: 'Why can’t everyone play the same track?',
        answer:
          'YouTube and SoundCloud decide availability. A track can be blocked in a country or need a provider sign-in. Try another upload if someone cannot play it.',
      },
    ],
  },
  {
    id: 'room-control',
    title: 'Room control',
    summary: 'Admins, permissions and playback modes.',
    questions: [
      {
        id: 'who-adds-skips',
        question: 'Can I control who adds or skips?',
        answer:
          'Yes. Set an admin password, then turn on Admins Only Add or Admins Only Skip. Friends never need the password to listen, add or vote unless you restrict it.',
        guide: { to: '/discovery/rooms', label: 'Room settings' },
      },
      {
        id: 'vote-to-skip',
        question: 'How does vote-to-skip work?',
        answer:
          'In Server Mode, Democratic Skip makes skipping a group decision: the room moves on once enough people vote to skip. Skip votes are separate from song votes.',
        guide: { to: '/discovery/rooms', label: 'Room settings' },
      },
      {
        id: 'server-host-mode',
        question: 'What are Server Mode and Host Mode?',
        answer:
          'Server Mode keeps the queue playing on its own as people come and go. Host Mode follows one person’s player, so their play, pause and skip lead everyone.',
        guide: { to: '/discovery/rooms#room-modes', label: 'Room modes' },
      },
      {
        id: 'public-unlisted',
        question: 'Are rooms public?',
        answer:
          'Only if you choose. Public rooms appear in Explore and need an admin password. Unlisted rooms stay out of Explore, but anyone with the link or name can still join.',
      },
      {
        id: 'share-admin',
        question: 'Can someone else help manage the room?',
        answer:
          'Share the admin password with them and they enter it in room settings. Admin access is separate from hosting playback or pairing a remote.',
      },
    ],
  },
  {
    id: 'watch',
    title: 'Watching YouTube',
    summary: 'Watch parties and shared video queues.',
    questions: [
      {
        id: 'watch-free',
        question: 'Do we need an extension or YouTube Premium?',
        answer:
          'No. Videos play through YouTube’s official embedded player in the browser or app, with no extension and no shared screen.',
        guide: { to: '/discovery/watching', label: 'Watching together' },
      },
      {
        id: 'which-videos',
        question: 'Which videos can we add?',
        answer:
          'Most YouTube videos, including long ones. Live streams, upcoming broadcasts, made-for-kids videos and videos that disable embedding are excluded, and age or country limits still apply.',
      },
      {
        id: 'netflix',
        question: 'Can we watch Netflix or other streaming services?',
        answer:
          'No. Watch rooms support YouTube only, not Netflix, Disney+, Prime Video or screen sharing.',
      },
      {
        id: 'chat',
        question: 'Can we chat while we watch or listen?',
        answer:
          'Yes. Every room has a chat that also shows adds, votes and skips. Anyone can turn chat off on their own device without affecting the room.',
        guide: { to: '/discovery/cinema', label: 'Watch parties' },
      },
    ],
  },
  {
    id: 'devices',
    title: 'Apps, TVs and remotes',
    summary: 'Where Zoff plays and how to control it.',
    questions: [
      {
        id: 'tv',
        question: 'Can we play a room on a TV?',
        answer:
          'Yes. Use the Android TV app, cast to Chromecast from a supported browser or app, or open the party screen on any big screen so people scan a code to join.',
        guide: { to: '/discovery/apps', label: 'Apps and devices' },
      },
      {
        id: 'remote',
        question: 'How do I use my phone as a remote?',
        answer:
          'On the player, open Remote Control and enable it. Scan its code with your phone, or enter the pairing code. Your phone then plays, pauses, skips and seeks without starting a second audio stream.',
        guide: { to: '/discovery/apps#remote', label: 'Phone as a remote' },
      },
      {
        id: 'same-room',
        question: 'We are in the same room. Should everyone play it?',
        answer:
          'Use one device for sound. Everyone else can still add and vote from their phones, or pair a phone as the remote.',
      },
      {
        id: 'keep-playing',
        question: 'Can the music keep playing while I browse Zoff?',
        answer:
          'Yes. Turn on Persistent player in your device settings and the room keeps playing in a small player while you explore other pages.',
      },
      {
        id: 'embed',
        question: 'Can I put a room on my website?',
        answer:
          'Yes. On a computer, open room settings and choose Embed player. Pick the layout and controls, then paste the code into your site.',
        guide: { to: '/discovery/rooms#embeds', label: 'Website embeds' },
      },
    ],
  },
];
