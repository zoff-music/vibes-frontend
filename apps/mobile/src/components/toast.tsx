import { classNames } from '@vibes/shared';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastTone = 'error' | 'info' | 'success';

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  activeToast: ToastMessage | null;
  showToast: (message: string, tone?: ToastTone) => void;
}

interface ToastProps {
  message: string;
  tone?: ToastTone;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);
  const showToast = useCallback(
    (message: string, tone: ToastTone = 'error') => {
      if (!message) return;
      nextId.current += 1;
      setActiveToast({ id: nextId.current, message, tone });
    },
    [],
  );

  useEffect(() => {
    if (!activeToast) return;
    const timeout = setTimeout(() => setActiveToast(null), toastDurationMs);
    return () => clearTimeout(timeout);
  }, [activeToast]);

  return (
    <ToastContext.Provider value={{ activeToast, showToast }}>
      <View className="flex-1">
        {children}
        <ToastViewport />
      </View>
    </ToastContext.Provider>
  );
}

export function ToastViewport() {
  const { activeToast } = useToast();
  if (!activeToast) return null;
  return (
    <SafeAreaView
      className="items-center px-5 pt-3"
      edges={['top']}
      pointerEvents="none"
      style={toastViewportStyle}
    >
      <Animated.View
        entering={FadeInDown.duration(180)}
        exiting={FadeOutUp.duration(180)}
        className={classNames(
          'max-w-80 self-center rounded-xl border-2 px-4 py-3 shadow-black/30 shadow-lg',
          activeToast.tone === 'error' && 'border-error bg-error',
          activeToast.tone === 'info' && 'border-accent bg-accent',
          activeToast.tone === 'success' && 'border-success bg-success',
        )}
      >
        <Text
          className={classNames(
            'font-heading text-sm leading-5',
            activeToast.tone === 'info' && 'text-mobile-dark-background',
            activeToast.tone !== 'info' && 'text-white',
          )}
        >
          {activeToast.message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

export function Toast({ message, tone = 'error' }: ToastProps) {
  const { showToast } = useToast();
  useEffect(() => {
    if (!message) return;
    showToast(message, tone);
  }, [message, showToast, tone]);
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
}

const toastDurationMs = 3_500;
const toastViewportStyle = {
  elevation: 50,
  left: 0,
  position: 'absolute' as const,
  right: 0,
  top: 0,
  zIndex: 50,
};
