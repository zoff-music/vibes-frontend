import { useEffect } from 'react';
import { AppState } from 'react-native';

export function useAppResume(onResume: () => void) {
  useEffect(() => {
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      const resumed =
        nextState === 'active' &&
        (previousState === 'background' || previousState === 'inactive');
      previousState = nextState;
      if (resumed) {
        void onResume();
      }
    });

    return () => subscription.remove();
  }, [onResume]);
}
