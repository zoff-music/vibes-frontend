import type { Providers } from '@vibes/models';
import {
  LegalDocument,
  LegalLink,
  LegalSection,
} from '../../../components/legal/LegalDocument';

interface PrivacyPolicyContentProps {
  providers: Providers;
}

export function PrivacyPolicyContent({ providers }: PrivacyPolicyContentProps) {
  const hasYouTube = providers.includes('youtube');
  const hasSoundCloud = providers.includes('soundcloud');
  const hasSpotify = providers.includes('spotify');

  return (
    <LegalDocument
      description="This policy explains what information Zoff processes, why it is needed, how long it is kept, and how third-party music and infrastructure providers handle data."
      title="Privacy Policy"
      updatedAt="25 July 2026"
    >
      <LegalSection title="1. Who operates Zoff">
        <p>
          Zoff is a free shared-music-room service operated by its developer.
          Questions, privacy requests, and deletion requests can be sent to{' '}
          <a
            className="text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-theme"
            href="mailto:privacy@zoff.me"
          >
            privacy@zoff.me
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information Zoff processes">
        <p>Zoff processes the information needed to run a listening room:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Room names, settings, queue entries, votes, playback state, and
            optional participant nicknames.
          </li>
          <li>
            Search terms and playlist-generation prompts that users submit.
          </li>
          <li>
            A pseudonymous session identifier stored in a cookie so a user can
            participate in a room and retain room permissions.
          </li>
          <li>
            Theme preferences stored in a cookie on the user&apos;s device.
          </li>
          <li>
            IP address, user agent, request timing, and application logs used
            for security, abuse prevention, rate limiting, reliability, and
            debugging.
          </li>
          <li>
            Aggregated, privacy-focused usage measurements collected through
            Zoff&apos;s self-hosted Plausible Analytics installation. Zoff does
            not use this analytics data for targeted advertising.
          </li>
        </ul>
        <p>
          Room administrator passwords are optional. When provided, they are
          processed to authenticate room administration and are stored as
          password hashes rather than readable passwords.
        </p>
      </LegalSection>

      {hasYouTube && (
        <LegalSection title="3. YouTube">
          <p>
            Zoff uses YouTube API Services and the YouTube embedded player to
            search for and play publicly available videos. Zoff sends user
            search terms to YouTube and receives public video information such
            as video IDs, titles, channel names, thumbnails, durations,
            categories, view counts, and like counts.
          </p>
          <p>
            YouTube search results are cached for up to three days to reduce
            duplicate API requests. When a user adds a result to a room, the
            relevant public track information is stored with that room so the
            shared queue can function.
          </p>
          <p>
            Use of YouTube features is subject to the{' '}
            <LegalLink href="https://www.youtube.com/t/terms">
              YouTube Terms of Service
            </LegalLink>
            . Google describes how it processes information in the{' '}
            <LegalLink href="https://policies.google.com/privacy">
              Google Privacy Policy
            </LegalLink>
            .
          </p>
          <p>
            Zoff does not download, extract, rehost, sell, or independently
            profile users from YouTube audiovisual content or API data.
          </p>
        </LegalSection>
      )}

      {hasSoundCloud && (
        <LegalSection title="SoundCloud">
          <p>
            Zoff uses the SoundCloud API and player to search for and play
            publicly available tracks. Search terms are sent to SoundCloud, and
            Zoff may receive track IDs, titles, uploader names, artwork,
            duration, genre, and playback information.
          </p>
          <p>
            SoundCloud search results are cached for up to three days to avoid
            repeated provider requests. Tracks selected for a room are stored
            with the room queue. Zoff does not claim ownership of SoundCloud
            user content.
          </p>
          <p>
            SoundCloud processes information under its{' '}
            <LegalLink href="https://soundcloud.com/pages/privacy">
              Privacy Policy
            </LegalLink>{' '}
            and{' '}
            <LegalLink href="https://soundcloud.com/terms-of-use">
              Terms of Use
            </LegalLink>
            .
          </p>
        </LegalSection>
      )}

      {hasSpotify && (
        <LegalSection title="Spotify">
          <p>
            Zoff can search Spotify&apos;s catalogue and play Spotify content
            for eligible Spotify users. Zoff may process search terms and
            catalogue information such as track, artist, album, artwork,
            duration, and Spotify identifiers.
          </p>
          <p>
            Spotify playback requires the user to connect a Spotify account.
            Zoff receives and stores OAuth access and refresh tokens needed to
            provide the connected playback feature. Zoff does not receive or
            store the user&apos;s Spotify password. Tokens are associated with
            the user&apos;s pseudonymous Zoff session and are not shared with
            other room participants.
          </p>
          <p>
            Users can revoke Zoff&apos;s access from their Spotify account
            settings. Spotify processes information under the{' '}
            <LegalLink href="https://www.spotify.com/legal/privacy-policy/">
              Spotify Privacy Policy
            </LegalLink>{' '}
            and{' '}
            <LegalLink href="https://www.spotify.com/legal/end-user-agreement/">
              Spotify Terms of Use
            </LegalLink>
            .
          </p>
        </LegalSection>
      )}

      <LegalSection title="AI playlist generation">
        <p>
          If a user asks Zoff to generate a playlist, the submitted prompt is
          sent to xAI&apos;s API to produce song and artist suggestions. Zoff
          then checks suggested public music metadata with an enabled music
          provider. Users should not include personal, confidential, or
          sensitive information in a playlist prompt.
        </p>
        <p>
          xAI processes API data under its applicable business terms and data
          practices. More information is available in the{' '}
          <LegalLink href="https://x.ai/legal/privacy-policy">
            xAI Privacy Policy
          </LegalLink>{' '}
          and{' '}
          <LegalLink href="https://x.ai/legal/terms-of-service-enterprise">
            xAI Enterprise Terms
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          Search caches expire automatically after three days. Playlist
          generation job records are retained for up to one day. Room and queue
          data remain available while the room exists and may be removed by room
          or service administrators. Security and operational logs are retained
          only as long as reasonably needed for reliability, troubleshooting,
          and abuse prevention.
        </p>
        <p>
          A user may request deletion of data associated with their Zoff session
          by contacting privacy@zoff.me. Zoff may need information sufficient to
          identify the relevant session or room. Provider permissions can also
          be revoked directly through the applicable provider account.
        </p>
      </LegalSection>

      <LegalSection title="Sharing and international processing">
        <p>
          Zoff shares information only when needed to operate the service,
          including with hosting and infrastructure providers, analytics
          infrastructure, xAI when playlist generation is requested, and the
          enabled music providers. Zoff does not sell personal information or
          use it for targeted advertising.
        </p>
        <p>
          These providers may process information in countries outside the
          user&apos;s country of residence under their own terms and privacy
          practices.
        </p>
      </LegalSection>

      <LegalSection title="Security, rights, and changes">
        <p>
          Zoff uses reasonable technical and organizational measures intended to
          protect service data. No internet service can guarantee absolute
          security.
        </p>
        <p>
          Depending on applicable law, users may have rights to request access,
          correction, deletion, restriction, portability, or objection to the
          processing of their personal information. Requests can be sent to
          privacy@zoff.me.
        </p>
        <p>
          This policy may be updated as Zoff changes. Material changes will be
          reflected by updating the date shown at the top of this page.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
