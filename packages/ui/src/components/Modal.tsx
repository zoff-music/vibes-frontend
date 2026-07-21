import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface Props {
  ariaLabelledBy: string;
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Modal({
  ariaLabelledBy,
  children,
  className = '',
  isOpen,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-start justify-center overflow-y-auto bg-black/70 px-4 pt-4 pb-safe backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <Button
        type="button"
        variant="ghost"
        size="none"
        className="fixed inset-0 h-full w-full"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={`panel-strong relative w-full max-w-lg animate-scale-in rounded-[32px] p-7 shadow-[0_0_28px_rgba(255,46,151,0.25)] ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
