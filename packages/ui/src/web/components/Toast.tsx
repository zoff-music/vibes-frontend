import { classNames, type ToastType } from '@vibes/shared';
import { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckIcon, InfoIcon } from '../icons';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  standalone?: boolean;
  onClose: () => void;
}

export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  standalone = true,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const bgColors = {
    success: 'bg-matcha border-matcha/20 text-ink',
    error: 'bg-error border-error/20 text-white',
    info: 'bg-sakura/80 border-sakura text-ink',
    warning: 'border-orange-300 bg-orange-500 text-white',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={classNames(
        'transform transition-all duration-300',
        standalone && 'fixed bottom-8 left-1/2 z-50 -translate-x-1/2',
        isVisible && 'translate-y-0 opacity-100',
        !isVisible && 'translate-y-4 opacity-0',
      )}
    >
      <div
        className={classNames(
          'flex items-center gap-3 rounded-2xl border-2 px-6 py-3 shadow-retro backdrop-blur-md',
          bgColors[type],
        )}
      >
        {type === 'success' && <CheckIcon className="h-5 w-5" />}
        {type === 'info' && <InfoIcon className="h-5 w-5 shrink-0" />}
        {(type === 'error' || type === 'warning') && (
          <AlertCircleIcon className="h-5 w-5 shrink-0" />
        )}
        <span className="font-bold text-sm tracking-wide sm:text-base">
          {message}
        </span>
      </div>
    </div>
  );
};
