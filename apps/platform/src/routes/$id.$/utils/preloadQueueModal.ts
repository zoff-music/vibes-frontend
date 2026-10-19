export async function loadAddToQueueModal() {
  const [module] = await Promise.all([
    import('../../../components/queue/AddToQueueModal'),
    import('./actions/playlist/clientAction'),
  ]);

  return {
    default: module.AddToQueueModal,
  };
}
