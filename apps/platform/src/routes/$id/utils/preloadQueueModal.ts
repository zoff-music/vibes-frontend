import { safeWrapAsync } from '@vibes/shared';

export async function loadAddToQueueModal() {
  const [module] = await Promise.all([
    import('../../../components/queue/AddToQueueModal'),
    import('../../../utils/room-actions/submitPlaylistAction'),
  ]);

  return {
    default: module.AddToQueueModal,
  };
}

export function preloadAddToQueueModal() {
  void safeWrapAsync(loadAddToQueueModal());
}
