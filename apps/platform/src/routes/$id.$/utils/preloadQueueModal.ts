export async function loadAddToQueueModal() {
  const [module] = await Promise.all([
    import('../../../components/queue/AddToQueueModal'),
    import('../../../utils/room-actions/submitPlaylistAction'),
  ]);

  return {
    default: module.AddToQueueModal,
  };
}
