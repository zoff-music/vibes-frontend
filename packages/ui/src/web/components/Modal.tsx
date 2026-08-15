import { classNames } from '@vibes/shared';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface Props {
  alignment?: 'center' | 'top';
  ariaLabelledBy: string;
  children: ReactNode;
  className?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  size?: 'lg' | 'md' | 'sm';
}

export function Modal({
  alignment = 'center',
  ariaLabelledBy,
  children,
  className = '',
  initialFocusRef,
  isOpen,
  onClose,
  size = 'md',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const firstFocusableElement = panelRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (
      initialFocusRef?.current ||
      firstFocusableElement ||
      panelRef.current
    )?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [initialFocusRef, isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
      className={classNames(
        'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 backdrop-blur-md',
        alignment === 'center' && 'py-4',
        alignment === 'top' && 'items-start pt-4 pb-safe',
      )}
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
        tabIndex={-1}
      />
      <motion.div
        initial={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, scale: 0.94, y: 28 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 32,
          mass: 0.8,
        }}
        ref={panelRef}
        tabIndex={-1}
        className={classNames(
          'panel-strong relative w-full rounded-4xl p-7 shadow-primary-panel',
          alignment === 'center' && 'my-auto',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-2xl',
          size === 'lg' && 'max-w-5xl',
          className,
        )}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
