import type { Providers } from '@vibes/models';
import {
  LegalDocument,
  LegalLink,
  LegalSection,
} from '../../../components/legal/LegalDocument';

interface TermsOfServiceContentProps {
  contactEmail: string;
  providers: Providers;
}

export function TermsOfServiceContent({
  contactEmail,
  providers,
}: TermsOfServiceContentProps) {
  const hasYouTube = providers.includes('youtube');
  const hasSoundCloud = providers.includes('soundcloud');
  const hasSpotify = providers.includes('spotify');

  return (
    <LegalDocument
      description="These terms govern use of Zoff, including shared rooms, music-provider integrations, playback, and playlist generation."
      title="Terms of Service"
      updatedAt="25 July 2026"
    >
      <LegalSection title="1. Agreement">
        <p>
          By accessing or using Zoff, the user agrees to these Terms of Service
          and acknowledges the Zoff Privacy Policy. A user who does not agree
          must not use the service.
        </p>
        <p>
          Users must be legally capable of agreeing to these terms in their
          country. A minor may use Zoff only with permission from a parent or
          legal guardian where required.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          Zoff provides shared listening rooms in which participants can search
          enabled music providers, add tracks to a queue, vote, control playback
          when permitted by room settings, and optionally generate playlist
          suggestions.
        </p>
        <p>
          Zoff may add, change, suspend, limit, or remove features and provider
          integrations. Music availability depends on the applicable provider,
          territory, account eligibility, content owner, and network conditions.
        </p>
      </LegalSection>

      <LegalSection title="3. Rooms and user conduct">
        <p>
          Users are responsible for room names, nicknames, prompts, queue
          choices, and other information they submit. Users must not:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Break applicable law or another person&apos;s rights.</li>
          <li>
            Harass others or submit hateful, abusive, deceptive, or illegal
            material.
          </li>
          <li>
            Attempt to disrupt, overload, bypass rate limits, probe, scrape, or
            gain unauthorized access to Zoff or a provider.
          </li>
          <li>
            Use automation to manipulate plays, votes, engagement, provider
            metrics, or room activity.
          </li>
          <li>
            Circumvent advertisements, geographic restrictions, account
            requirements, access controls, or playback restrictions.
          </li>
          <li>
            Download, extract, record, separate, redistribute, or rehost
            provider audio or video through Zoff.
          </li>
        </ul>
        <p>
          Zoff may rate-limit requests, remove content from a room, restrict
          access, or remove a room when reasonably necessary to protect users,
          providers, or the service.
        </p>
      </LegalSection>

      {hasYouTube && (
        <LegalSection title="YouTube">
          <p>
            Zoff uses YouTube API Services and the YouTube embedded player. By
            using YouTube features through Zoff, users also agree to be bound by
            the{' '}
            <LegalLink href="https://www.youtube.com/t/terms">
              YouTube Terms of Service
            </LegalLink>
            . Google&apos;s handling of information is described in the{' '}
            <LegalLink href="https://policies.google.com/privacy">
              Google Privacy Policy
            </LegalLink>
            .
          </p>
          <p>
            YouTube and its content owners retain all rights in YouTube content.
            Zoff does not grant any right to copy, download, modify, extract,
            redistribute, or commercially exploit that content. Zoff is not
            endorsed by YouTube or Google.
          </p>
        </LegalSection>
      )}

      {hasSoundCloud && (
        <LegalSection title="SoundCloud">
          <p>
            SoundCloud content is provided by SoundCloud and its uploaders.
            Users must comply with the{' '}
            <LegalLink href="https://soundcloud.com/terms-of-use">
              SoundCloud Terms of Use
            </LegalLink>{' '}
            and respect uploader and rightsholder permissions. Zoff does not
            own, license, or grant additional rights in SoundCloud content and
            is not endorsed by SoundCloud.
          </p>
        </LegalSection>
      )}

      {hasSpotify && (
        <LegalSection title="Spotify">
          <p>
            Spotify functionality is subject to the{' '}
            <LegalLink href="https://www.spotify.com/legal/end-user-agreement/">
              Spotify Terms of Use
            </LegalLink>
            . Playback eligibility, including any Premium requirement, is
            determined by Spotify. Spotify and its licensors retain all rights
            in Spotify content.
          </p>
          <p>
            Users must not copy, capture, redistribute, synchronize, modify, or
            otherwise exploit Spotify content through Zoff. Zoff is not endorsed
            by Spotify.
          </p>
        </LegalSection>
      )}

      <LegalSection title="Playlist generation">
        <p>
          Playlist generation uses an automated AI system to suggest songs from
          a user&apos;s prompt. Suggestions can be incomplete, inaccurate,
          unsuitable, or unavailable. Zoff attempts to validate provider
          metadata but does not guarantee that every suggestion, provider ID,
          result, ordering, or description is correct.
        </p>
        <p>
          Users must not submit personal, confidential, illegal, or harmful
          information in prompts. Generated results are suggestions, not
          professional advice or a representation that Zoff owns, licenses, or
          endorses the suggested music.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Zoff&apos;s software, design, branding, and original materials belong
          to their respective owners and are protected by applicable law.
          Third-party names, marks, metadata, artwork, audio, and video remain
          the property of their respective providers and rightsholders.
        </p>
        <p>
          Provider names and marks are used only to identify the source of
          content or functionality. Their appearance does not imply sponsorship
          or endorsement.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers and liability">
        <p>
          Zoff is provided on an “as is” and “as available” basis. To the
          maximum extent permitted by law, Zoff makes no warranty that the
          service will be uninterrupted, error-free, secure, or that provider
          content or generated suggestions will remain available or accurate.
        </p>
        <p>
          To the maximum extent permitted by law, Zoff&apos;s operator will not
          be liable for indirect, incidental, special, consequential, or
          punitive damages, or for loss of data, content, access, revenue, or
          opportunity arising from use of the service. Nothing in these terms
          excludes liability that cannot legally be excluded.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          These terms may be updated as Zoff or provider requirements change.
          The updated date will be shown at the top of this page. Continued use
          after an update constitutes acceptance of the revised terms where
          permitted by law.
        </p>
        <p>
          Questions about these terms can be sent to{' '}
          <a
            className="text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-theme"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
