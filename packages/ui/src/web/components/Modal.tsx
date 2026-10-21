import { classNames } from '@vibes/shared';
import {
  AnimatePresence,
  m as motion,
  useIsPresent,
  useReducedMotion,
} from 'framer-motion';

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'preact/compat';
import { createPortal } from 'react-dom';

interface Props {
  alignment?: 'center' | 'top';
  ariaLabelledBy: string;
  children: ReactNode;
  className?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  panelRef?: { current: HTMLDivElement | null };
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
  panelRef,
  size = 'md',
}: Props) {
  const internalPanelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const shouldReduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const visible = isOpen && isPresent;
  const portalReady = useSyncExternalStore(
    subscribeHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const initiallyServerRendered = useRef(!portalReady && isOpen);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!visible || !portalReady) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();

        return;
      }

      if (event.key !== 'Tab' || !internalPanelRef.current) return;

      const focusableElements =
        internalPanelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (focusableElements.length === 0) {
        event.preventDefault();
        internalPanelRef.current.focus();

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

    const firstFocusableElement =
      internalPanelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
    (
      initialFocusRef?.current ||
      firstFocusableElement ||
      internalPanelRef.current
    )?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [initialFocusRef, visible, portalReady]);

  const setPanelRef = useCallback(
    (element: HTMLDivElement | null) => {
      internalPanelRef.current = element;

      if (panelRef) panelRef.current = element;
    },
    [panelRef],
  );

  const content = (
    <AnimatePresence propagate initial={!initiallyServerRendered.current}>
      {visible && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          <button
            type="button"
            className="fixed inset-0 h-full w-full rounded-none border-0 bg-transparent p-0"
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
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 16 }
            }
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            ref={setPanelRef}
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
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render the same inline dialog on the server and during hydration. Moving
  // it to the document layer afterward must not replay its entrance animation.
  if (!portalReady) return content;

  return createPortal(content, document.body);
}

function subscribeHydration() {
  return () => {};
}

function clientSnapshot() {
  return true;
}

function serverSnapshot() {
  return false;
}
