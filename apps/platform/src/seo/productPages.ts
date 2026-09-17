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
    slug: 'listen-together',
    label: 'Listen together',
    title: 'Listen to Music Together Online | Zoff',
    description:
      'Listen to music with friends online. Start a free Zoff room, share the link and build a queue together with synchronized playback and song voting.',
    heading: 'Listen together, from anywhere',
    actionLabel: 'Start listening',
    introduction:
      'Different headphones. Same track. Share a room link with your friends and keep the music in sync while you chat or game.',
    sections: [
      {
        title: 'One room, wherever you are',
        body: 'Create a room and share its link. Friends can join in a browser without creating an account, or use the mobile app. Pick a display name so people can see who brought each song to the queue.',
      },
      {
        title: 'Playback that stays together',
        body: 'Server mode keeps the room on a shared playback timeline and moves through the queue automatically. Each listener plays music through the supported provider’s player. A browser may need a tap to start audio, and track availability can vary by provider or region.',
      },
      {
        title: 'Make the soundtrack a group decision',
        body: 'Search the enabled music providers or paste a song link, then add your choice to the queue. Vote for the songs you want to hear next. Room settings decide who can add tracks or skip, so a relaxed listening session does not have to become a battle over the controls.',
      },
      {
        title: 'Keep the conversation where it is',
        body: 'Zoff handles the music while you chat wherever you already spend time, whether that is a Discord call or your usual group chat. Share the room link there; Zoff does not need a chat bot or access to your conversation.',
      },
    ],
  },
  {
    slug: 'shared-music-queue',
    label: 'Shared music queue',
    title: 'Shared Music Queue & Collaborative Playlists | Zoff',
    description:
      'Build a shared music queue with friends. Add tracks, vote on what plays next or generate a playlist from a mood with AI. Free, no account needed.',
    heading: 'A music queue everyone can shape',
    actionLabel: 'Build a shared queue',
    introduction:
      'Bring a song, import a playlist, or describe a mood and let AI get the queue started. Then let everyone add their own picks and vote.',
    sections: [
      {
        title: 'Add a song, not another message',
        body: 'Search supported providers such as YouTube and SoundCloud, or paste a track link. Add a choice straight to the room instead of sending links for someone else to collect. The enabled providers and room permissions determine what each guest can add.',
      },
      {
        title: 'Let the room vote',
        body: 'Song votes help your group shape the queue. For skips, room admins can choose democratic voting or restrict skipping to admins. These controls let a collaborative playlist stay collaborative without handing every guest unrestricted playback control.',
      },
      {
        title: 'Start with a playlist',
        body: 'When playlist import is enabled and you have the required room permissions, paste a supported playlist link to bring an existing selection into the room. Import progress lets you follow the additions while the queue remains available for listening.',
      },
      {
        title: 'Choose what happens after playback',
        body: 'Keep played tracks in rotation for a repeating soundtrack, or enable removal after play for a queue that moves on. Duplicate-song and admin-only addition settings help tailor the queue to a small group, a shared workspace or a larger gathering.',
      },
    ],
  },
  {
    slug: 'party-music',
    label: 'Party music',
    title: 'Party Music Queue & Shared Jukebox | Zoff',
    description:
      'Give your party a shared music queue. Guests suggest songs from their phones while you keep control of playback, skipping and additions with Zoff.',
    heading: 'Your party. Everyone’s soundtrack.',
    actionLabel: 'Set up a party room',
    introduction:
      'One device on the speakers. Everyone else on requests. Give guests the room link, not your unlocked phone.',
    sections: [
      {
        title: 'One player for the room',
        body: 'Use a computer or supported TV setup for the main player and connect it to your speakers. Guests can open the room on their phones to add songs and vote. Turn off the player on devices that only need to control the queue to avoid several speakers playing at once.',
      },
      {
        title: 'Keep a host in charge',
        body: 'Host mode gives the host playback control. An optional room-admin password protects settings, and admins-only skip or add controls let you decide how open the party jukebox should be. Song voting still gives guests a way to express what they want to hear.',
      },
      {
        title: 'Share a link, not your device',
        body: 'Guests do not need a Zoff account to join. Send the room link to your group, then let people browse the queue from their own devices. A paired remote can also control another Zoff player without becoming an additional listener.',
      },
      {
        title: 'Plan around your music providers',
        body: 'Music plays through official provider players, not downloaded audio files. Availability, ads and playback restrictions are controlled by the provider. For public events or commercial venues, check the music rights and provider terms that apply to your use.',
      },
    ],
  },
  {
    slug: 'music-room',
    label: 'Music rooms',
    title: 'Create an Online Music Room | Zoff',
    description:
      'Create an online music room for friends, gaming or a shared workspace. Choose playback controls, share the link and build a collaborative queue in Zoff.',
    heading: 'Your room. Your ground rules.',
    actionLabel: 'Configure a music room',
    introduction:
      'Let the queue run automatically or put a host in charge. Set up a music room around how your group likes to listen.',
    sections: [
      {
        title: 'Create and share',
        body: 'Choose a room name, select the music sources you want to enable and start a session. Share the link so friends can join the same queue. You do not need to create an account before making a room.',
      },
      {
        title: 'Automatic playback or a host',
        body: 'In server mode, the room keeps a shared playback timeline and advances automatically. In host mode, the host directs playback. Pick the approach that fits an ongoing radio-style room or a session where someone wants to guide the music.',
      },
      {
        title: 'Discoverable or off the public list',
        body: 'A public room can appear under Live now while people are listening. Leave it off the public list when you only want to share the link yourself. An unlisted room is not an access-controlled vault: anyone with its link or name may join.',
      },
      {
        title: 'Room controls that fit your group',
        body: 'Set an admin password to protect room controls. Choose who may add or skip songs, whether skipping needs votes, and whether played tracks stay in the queue. The admin password controls administration; it is not a password for guests entering the room.',
      },
    ],
  },
  {
    slug: 'tv',
    label: 'Music on TV',
    title: 'Shared Music on TV & Chromecast | Zoff',
    description:
      'Put your Zoff music room on a bigger screen. Use supported casting or Android TV, then share the queue with friends and control playback from your phone.',
    heading: 'Put the queue on the big screen.',
    actionLabel: 'Create a room for your TV',
    introduction:
      'Use Android TV or supported casting for playback. Keep your phone free for finding the next song or controlling the player.',
    sections: [
      {
        title: 'Cast from a supported device',
        body: 'Where Google Cast is supported, use the Cast control in Zoff to send the room to a compatible receiver. Casting depends on your browser or app, network and receiver. Unsupported browsers do not show a Cast button; a normal browser room remains available.',
      },
      {
        title: 'Use the Android TV app',
        body: 'Zoff also has an Android TV app designed for a remote and a larger display. Join the room on the TV and let friends open the same room on their phones. App availability depends on the device and store region.',
      },
      {
        title: 'Pair a phone as a remote',
        body: 'Enable remote control on the player, then pair your phone with the displayed code or QR code. A paired remote controls that player without adding another listener. Keep the player enabled on the device connected to your speakers.',
      },
      {
        title: 'The provider still plays the music',
        body: 'Zoff uses official music-provider players across its supported screens. Track availability and playback behavior can differ between devices. Try your intended setup before a gathering, including audio output and the providers enabled in your room.',
      },
    ],
  },
  {
    slug: 'apps',
    label: 'Get the apps',
    title: 'Zoff Apps for iOS, Android & Android TV',
    description:
      'Get Zoff for iOS and Android, explore Android TV, or listen in your browser. Join shared music rooms, add songs and control your player from your phone.',
    heading: 'Small screen. Full control.',
    actionLabel: 'Use Zoff in your browser',
    introduction:
      'Add a track from the sofa, vote from the kitchen, or pair your phone as a remote. Get Zoff for iOS and Android.',
    sections: [
      {
        title: 'iPhone and iPad',
        body: 'Get Zoff from the App Store to join rooms, add songs, vote and use your device as a paired remote. The native app gives you the same shared-room idea with a mobile interface and device settings.',
      },
      {
        title: 'Android phones and tablets',
        body: 'Find Zoff on Google Play. Open a room by name, build the queue with friends and choose whether this device plays music or only participates in controlling the room.',
      },
      {
        title: 'Android TV and casting',
        body: 'Use the Android TV app on a supported TV device, or Google Cast where available. Your room stays shared with the phones and browsers that join it, so the big screen does not have to be the only way to choose music.',
      },
      {
        title: 'No download needed on the web',
        body: 'You can also create or join a room right here at zoff.me. No Zoff account is required to begin. Music sources, track availability and playback restrictions depend on the enabled providers and their official players.',
      },
    ],
  },
];
