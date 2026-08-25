import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useControllerRemote } from '@/hooks/use-controller-remote';
import { useRoomSession } from '@/providers/app-provider';
import { RemoteControl } from './remote-control';
import { RemotePairing } from './remote-pairing';

export function RemoteScreen() {
  const searchParams = useLocalSearchParams<{
    pair?: string | string[];
    remoteId?: string | string[];
  }>();
  const router = useRouter();
  const { providers } = useRoomSession();
  const [controller, controllerActions] = useControllerRemote();
  const { pairWithToken, setRemoteId } = controllerActions;
  const consumedPairingLinkRef = useRef('');

  useEffect(() => {
    const remoteId = getSearchParam(searchParams.remoteId);
    const pairingToken = getSearchParam(searchParams.pair);
    const pairingLink = `${remoteId}:${pairingToken}`;
    if (!remoteId || consumedPairingLinkRef.current === pairingLink) return;

    consumedPairingLinkRef.current = pairingLink;
    if (pairingToken) {
      void pairWithToken(remoteId, pairingToken).finally(() =>
        router.replace('/remote'),
      );
      return;
    }
    setRemoteId(remoteId);
    router.replace('/remote');
  }, [
    pairWithToken,
    router,
    searchParams.pair,
    searchParams.remoteId,
    setRemoteId,
  ]);

  if (!controller.remote) {
    return (
      <RemotePairing
        controller={controller}
        controllerActions={controllerActions}
      />
    );
  }
  return (
    <RemoteControl
      controller={controller}
      controllerActions={controllerActions}
      providers={providers}
    />
  );
}

function getSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}
