import type { Providers } from '@vibes/models';
import {
  LegalDocument,
  LegalLink,
  LegalSection,
  LegalSubsection,
} from '../../../components/legal/LegalDocument';

interface PrivacyPolicyContentProps {
  privacyEmail: string;
  providers: Providers;
}

export function PrivacyPolicyContent({
  privacyEmail,
  providers,
}: PrivacyPolicyContentProps) {
  const hasYouTube = providers.includes('youtube');
  const hasSoundCloud = providers.includes('soundcloud');
  const hasProviders = hasYouTube || hasSoundCloud;

  return (
    <LegalDocument
      description="This policy explains data processing in Zoff Music and Watch rooms, including providers, shared queues, chat, AI playlist generation, and room-name moderation."
      title="Privacy Policy"
      updatedAt="26 November 2026"
    >
      <LegalSection id="policy-1-who-operates-zoff" title="Who operates Zoff">
        <p>
          Zoff is a free service for listening and watching together in shared
          rooms, operated by its developer. Questions, privacy requests, and
          deletion requests can be sent to{' '}
          <a
            className="hover:text-theme dark:text-secondary text-cyan-800 underline decoration-current/40 underline-offset-4 transition-colors"
            href={`mailto:${privacyEmail}`}
          >
            {privacyEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection
        id="policy-2-information-zoff-processes"
        title="Information Zoff processes"
      >
        <p>
          Zoff processes the information needed to run Music and Watch rooms:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Room names, room type (Music or Watch), settings, queue entries,
            votes, playback state, chat messages, room activity, and optional
            participant nicknames.
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
            not use this analytics data for targeted advertising. The browser
            tracker is bundled with the application and sends events through
            Zoff&apos;s backend without forwarding application cookies or
            authentication credentials to Plausible. Browser analytics respect
            Do Not Track, Global Privacy Control, and Plausible&apos;s local
            opt-out setting (plausible_ignore).
          </li>
        </ul>
        <p>
          Room participants can see the shared queue, participant nicknames,
          chat messages, and room activity. Public rooms can appear in the
          corresponding Music or Watch room browser with their name, participant
          count, and queue size. Do not share confidential information in a
          room.
        </p>
        <p>
          Room administrator passwords are optional. When provided, they are
          processed to authenticate room administration and are stored as
          password hashes rather than readable passwords.
        </p>
      </LegalSection>

      {hasProviders && (
        <LegalSection id="policy-3-providers" title="Providers">
          <p>
            Zoff connects to the media providers enabled for the service. Music
            rooms support enabled YouTube and SoundCloud integrations; Watch
            rooms use YouTube only. The room type determines the search and
            import rules and is fixed when the room is created.
            Provider-specific processing and terms are described below only when
            that integration is available.
          </p>

          <LegalSubsection title="Importing a private playlist">
            <p>
              When you paste a playlist link, Zoff first asks the provider for
              its contents using public access. If the provider restricts
              access, you can sign in with the account that can open the
              playlist. For YouTube, Zoff requests read-only access to your
              YouTube account to read the playlist you selected.
            </p>
            <p>
              Zoff temporarily stores the provider access token on its server.
              When the import resumes, Zoff deletes the stored token and uses it
              in memory to read the playlist for your preview. Unused import
              authorizations expire within five minutes and are cleaned up
              automatically. Zoff does not retain a refresh token for imports.
            </p>
            <p>
              When you add the playlist, other people in the room can see the
              eligible items and their order in the shared queue, including
              titles, creator names and artwork. The original playlist keeps its
              privacy setting. Removing Zoff from your{' '}
              <LegalLink href="https://myaccount.google.com/connections">
                Google Account connections
              </LegalLink>{' '}
              revokes Google access. Items already added to a room remain in its
              queue until removed.
            </p>
          </LegalSubsection>

          {hasYouTube && (
            <LegalSubsection title="YouTube">
              <p>
                Zoff uses YouTube API Services and the YouTube embedded player
                to search for and play publicly available videos. Zoff sends
                user search terms to YouTube and receives public video
                information such as video IDs, titles, channel names,
                thumbnails, durations, categories, view counts, and like counts.
              </p>
              <p>
                YouTube search results are cached for up to seven days to reduce
                duplicate API requests. When a user adds a result to a room, the
                relevant public video information is stored with that room so
                the shared queue can function. Queue metadata is scheduled for
                refresh after 21 days. If it cannot be refreshed, a separate
                cleanup removes it after 25 days without a successful refresh,
                including a paused or currently selected video. Search caches,
                import staging, and room event replay have separate expiration
                periods. An expired current video stops playing locally when the
                room receives the update.
              </p>
              <p>
                Videos YouTube marks as made for kids are excluded from search,
                pasted links, playlist imports, and generated selections.
                Playlist previews explain when these videos have been skipped.
                If a stored video is later marked as made for kids, Zoff removes
                it when its metadata is refreshed.
              </p>
              <p>
                Loading an embedded YouTube player connects your browser to
                Google and shares information such as your IP address, browser
                details, and the requested video. YouTube uses this information
                to display the player, check playback restrictions, and prevent
                fraud and abuse. Playback shares additional information with
                YouTube. When autoplay is enabled, this can happen on page load
                without a separate click on the player.
              </p>
              <p>
                YouTube and other third parties may serve advertisements and
                store or access cookies or similar information on your device
                through their players, under their own policies. These are
                separate from Zoff&apos;s session and theme cookies. Browser
                privacy controls can restrict third-party storage, although
                doing so may affect playback. Turning autoplay off in an embed
                delays playback, but does not prevent the initial connection
                when its player loads.
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
            </LegalSubsection>
          )}

          {hasSoundCloud && (
            <LegalSubsection title="SoundCloud">
              <p>
                Zoff uses the SoundCloud API and player to search for and play
                publicly available tracks. Search terms are sent to SoundCloud,
                and Zoff may receive track IDs, titles, uploader names, artwork,
                duration, genre, and playback information.
              </p>
              <p>
                SoundCloud search results are cached for up to seven days to
                avoid repeated provider requests. Tracks selected for a room are
                stored with the room queue. Zoff does not claim ownership of
                SoundCloud user content.
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
            </LegalSubsection>
          )}
        </LegalSection>
      )}

      <LegalSection title="AI playlist generation">
        <p>
          If a user asks Zoff to generate a playlist, the submitted prompt is
          sent to Google&apos;s Gemini API. Music prompts request music
          suggestions; Watch prompts request videos to watch. For generation
          within an existing room, titles and publisher names from the current
          item and queued items may also be sent to avoid duplicate suggestions.
          Zoff then checks suggested public metadata with the room&apos;s
          supported media provider. Users should not include personal,
          confidential, or sensitive information in a playlist prompt.
        </p>
        <p>
          Google processes Gemini API data under its applicable terms and data
          practices. More information is available in the{' '}
          <LegalLink href="https://policies.google.com/privacy">
            Google Privacy Policy
          </LegalLink>{' '}
          and{' '}
          <LegalLink href="https://ai.google.dev/gemini-api/terms">
            Gemini API Additional Terms
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title="Room and playlist name moderation">
        <p>
          Zoff sends room names (the names of shared playlists), including names
          of private rooms, to JEV for automated checks for hateful slurs and
          other severely derogatory language. This moderation request contains
          the names and moderation instructions, not chat messages, playlist
          contents, participant nicknames, room passwords, or session tokens.
          Avoid including personal or confidential information in a room name.
        </p>
        <p>
          Zoff stores the review status and any resulting flag with the room. A
          flagged room displays an Explicit label and cannot be made public or
          appear in public room listings. Flagging alone does not delete the
          room or stop playback. Service administrators can review flags and
          correct mistakes; contact {privacyEmail} to request a review.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          Search results are cached for up to seven days from when they are
          fetched; empty search results expire after 15 minutes. Playlist
          generation job records are retained for up to one day. Room and queue
          data remain available while the room exists and may be removed by room
          or service administrators. Security and operational logs are retained
          only as long as reasonably needed for reliability, troubleshooting,
          and abuse prevention.
        </p>
        <p>
          A user may request deletion of data associated with their Zoff session
          by contacting {privacyEmail}. Zoff may need information sufficient to
          identify the relevant session or room. Verified deletion requests are
          completed within seven days. Deleting data held by Zoff does not
          delete data held by YouTube, Google, JEV, or another provider;
          provider data and permissions must be managed directly with that
          provider.
        </p>
      </LegalSection>

      <LegalSection title="Sharing and international processing">
        <p>
          Zoff shares information only when needed to operate the service,
          including with hosting and infrastructure providers, analytics
          infrastructure, Google when Gemini playlist generation is requested,
          JEV for room-name moderation, and the enabled media providers. Zoff
          does not sell personal information or use it for targeted advertising.
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
          processing of their personal information. Requests can be sent to{' '}
          {privacyEmail}.
        </p>
        <p>
          This policy may be updated as Zoff changes. Material changes will be
          reflected by updating the date shown at the top of this page.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
