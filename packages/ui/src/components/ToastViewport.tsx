import { TOAST_EVENT_NAME, type ToastEventDetail } from '@vibes/shared';
import { useEffect, useRef, useState } from 'react';
import { Toast } from './Toast';

interface ActiveToast extends ToastEventDetail {
  id: number;
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEventDetail>;
      const toast = customEvent.detail;
      if (!toast?.message) {
        return;
      }

      setToasts((currentToasts) => {
        const isDuplicate = currentToasts.some(
          (currentToast) =>
            currentToast.message === toast.message &&
            currentToast.type === toast.type,
        );
        if (isDuplicate) {
          return currentToasts;
        }

        nextId.current += 1;
        return [...currentToasts.slice(-2), { ...toast, id: nextId.current }];
      });
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-100 flex flex-col items-center gap-3 sm:inset-x-auto sm:right-8 sm:bottom-8 sm:items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          standalone={false}
          {...(toast.duration && { duration: toast.duration })}
          onClose={() =>
            setToasts((currentToasts) =>
              currentToasts.filter(
                (currentToast) => currentToast.id !== toast.id,
              ),
            )
          }
        />
      ))}
    </div>
  );
}
