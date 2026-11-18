import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { FeatureSection } from './FeatureSection';

const LazyPartyScreenDemo = lazy(() =>
  import('../seo/PartyScreenDemo').then((module) => ({
    default: module.PartyScreenDemo,
  })),
);

export function PartyScreenGuide() {
  return (
    <FeatureSection
      id="party-screen"
      title="Put the room on the big screen."
      description="Open the party screen on a TV or projector. The video plays big, and a QR code lets everyone on the sofa join, add videos and vote from their phones."
      note="Prefer a host in charge? Switch the room to Host Mode in room settings."
      link={{ to: '/discovery/apps', label: 'TVs, Chromecast and remotes' }}
    >
      <DeferredContent fallback={<div aria-hidden="true" className="h-130" />}>
        <LazyPartyScreenDemo />
      </DeferredContent>
    </FeatureSection>
  );
}
