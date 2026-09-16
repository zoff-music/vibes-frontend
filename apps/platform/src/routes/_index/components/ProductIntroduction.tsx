import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';

export function ProductIntroduction() {
  return (
    <section
      aria-labelledby="listen-together-heading"
      className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-4 pb-10 text-theme sm:px-10"
    >
      <h2 id="listen-together-heading" className="font-pixel text-xl">
        Listen together, from anywhere
      </h2>
      <p className="mt-4 text-theme-muted leading-relaxed">
        Zoff is a free shared music room where friends build a queue together.
        Create a room, share its link and bring everyone into the same listening
        session. Search supported providers such as YouTube and SoundCloud, add
        a song, and vote on what you want to hear next. There is no Zoff account
        to create before you start.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <h3 className="font-pixel text-sm">A shared queue</h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Give everyone a say in the soundtrack. Friends can suggest tracks
            and vote on the queue, with room settings deciding who may add or
            skip songs. Supported playlist imports can bring an existing
            selection into the room.
          </p>
        </div>
        <div>
          <h3 className="font-pixel text-sm">Synchronized listening</h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Server mode keeps listeners on the room’s playback timeline and
            advances through the queue. Choose host mode when one person should
            direct playback. Music plays through the providers’ official
            players, subject to their availability and restrictions.
          </p>
        </div>
        <div>
          <h3 className="font-pixel text-sm">No account required</h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Join from a browser or the mobile app with a room link or name. An
            optional admin password protects room controls. Keep your room off
            the public list, or make it discoverable under Live now while people
            are listening.
          </p>
        </div>
      </div>
      <p className="mt-6 text-theme-muted leading-relaxed">
        Use Zoff for a party with friends, a Discord call, a gaming session or a
        shared workspace. Play on one device when you are together, or listen on
        your own devices when you are apart. Supported casting, Android TV and
        paired remote control give you more ways to choose the main player.
      </p>
      <p className="mt-4 text-theme-muted leading-relaxed">
        Ready to pick the first track?{' '}
        <Link
          to="/rooms/create"
          className="rounded text-theme underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Create a shared music room
        </Link>
        , send the link to your friends and make the next song a group decision.
      </p>
      <div className="mt-8 border-theme border-t pt-6">
        <ProductLinks />
      </div>
    </section>
  );
}
