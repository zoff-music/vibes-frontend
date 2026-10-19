import type { ControllerLoaderData } from './createControllerRoomData';

let active: { id: string; data: ControllerLoaderData } | undefined;

export function retainController(id: string, data: ControllerLoaderData) {
  const owner = { id, data };
  active = owner;

  return () => {
    if (active === owner) active = undefined;
  };
}

export function retainedController(id: string) {
  return active?.id === id ? active.data : undefined;
}
