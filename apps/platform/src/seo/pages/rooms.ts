import type { ProductPage } from '../productPages';

export const page: ProductPage = {
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
};
