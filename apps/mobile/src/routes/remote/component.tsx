import { RemoteControl } from '@/components/remote-control';
import { RemotePairing } from '@/components/remote-pairing';
import { useControllerRemote } from '@/hooks/use-controller-remote';
import { useRoomSession } from '@/providers/app-provider';

export default function RemoteScreen() {
  const { providers } = useRoomSession();
  const [controller, controllerActions] = useControllerRemote();

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
