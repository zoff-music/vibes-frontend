import { RemoteControl } from '@/components/remote-control';
import { RemotePairing } from '@/components/remote-pairing';
import { useControllerRemote } from '@/hooks/use-controller-remote';
import { useApp } from '@/providers/app-provider';

export default function RemoteScreen() {
  const { providers } = useApp();
  const controller = useControllerRemote();

  if (!controller.remote) return <RemotePairing controller={controller} />;
  return <RemoteControl controller={controller} providers={providers} />;
}
