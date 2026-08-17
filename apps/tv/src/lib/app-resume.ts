import { AppState } from 'react-native';

export function subscribeToAppResume(onResume: () => void) {
  let previousState = AppState.currentState;
  const subscription = AppState.addEventListener('change', (nextState) => {
    const resumed =
      nextState === 'active' &&
      (previousState === 'background' || previousState === 'inactive');
    previousState = nextState;
    if (resumed) {
      onResume();
    }
  });
  return () => subscription.remove();
}
