import { useEffect, useState } from 'react';
import { Keyboard, type KeyboardEvent, Platform } from 'react-native';

export function useKeyboardVisible() {
  const [visible, setVisible] = useState((Keyboard.metrics()?.height ?? 0) > 0);
  useEffect(() => {
    // Display transitions can report a shown keyboard with a zero-height frame.
    const updateVisibility = (event: KeyboardEvent) => {
      setVisible(event.endCoordinates.height > 0);
    };
    setVisible((Keyboard.metrics()?.height ?? 0) > 0);
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      updateVisibility,
    );
    const changeFrame = Keyboard.addListener(
      'keyboardWillChangeFrame',
      updateVisibility,
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
      changeFrame.remove();
    };
  }, []);

  return visible;
}
