import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { FeatureSection } from '../../../components/discovery/FeatureSection';

const LazyRemotePlayerDemo = lazy(() =>
  import('./RemotePlayerDemo').then((module) => ({
    default: module.RemotePlayerDemo,
  })),
);

interface RemotePreviewProps {
  showAppsLink?: boolean;
}

export function RemotePreview({ showAppsLink = true }: RemotePreviewProps) {
  return (
    <FeatureSection
      id="remote"
      title="Big sound. Small remote."
      description="Let a TV or computer play the room. Pair your phone to play, pause, skip or seek without leaving the sofa."
      {...(showAppsLink && {
        link: { to: '/discovery/apps', label: 'Apps and remotes' },
      })}
    >
      <DeferredContent
        fallback={<div aria-hidden="true" className="h-180 sm:h-130" />}
      >
        <LazyRemotePlayerDemo />
      </DeferredContent>
    </FeatureSection>
  );
}
