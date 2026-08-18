import { useControllerRemote } from '@/hooks/use-controller-remote';
import { useRoomSession } from '@/providers/app-provider';
import { RemoteControl } from './remote-control';
import { RemotePairing } from './remote-pairing';

export function RemoteScreen() {
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
