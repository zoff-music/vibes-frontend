import { classNames } from '@vibes/shared';
import type { ReactNode, RefObject } from 'react';
import { Modal } from '../web/components/Modal';
import { TerminalButton } from './TerminalButton';

interface TerminalModalProps {
  ariaLabelledBy: string;
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  panelRef?: RefObject<HTMLDivElement | null>;
  size?: 'lg' | 'md' | 'sm';
  title: ReactNode;
}

export function TerminalModal({
  ariaLabelledBy,
  bodyClassName,
  children,
  className,
  footer,
  initialFocusRef,
  isOpen,
  onClose,
  panelRef,
  size = 'md',
  title,
}: TerminalModalProps) {
  return (
    <Modal
      alignment="top"
      ariaLabelledBy={ariaLabelledBy}
      className={classNames(
        '!rounded-none !border !border-[#71f5ad] !bg-[#020e09] !p-0 !shadow-[0_0_4rem_rgba(49,255,154,0.16)] font-mono text-[#b9ffda]',
        className,
      )}
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
      panelRef={panelRef}
      size={size}
    >
      <header className="flex items-center justify-between gap-4 bg-[#71f5ad] px-4 py-2 font-bold text-[#03150d] text-xs uppercase">
        <h2 id={ariaLabelledBy}>{title}</h2>
        <TerminalButton onClick={onClose} variant="header">
          [ESC] CLOSE
        </TerminalButton>
      </header>
      <div
        className={classNames(
          'max-h-[calc(100dvh-7rem)] overflow-y-auto p-4 sm:p-6',
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer && (
        <footer className="border-[#71f5ad]/30 border-t px-4 py-2 text-[#a6ffd0]/45 text-[0.58rem] uppercase tracking-[0.12em]">
          {footer}
        </footer>
      )}
    </Modal>
  );
}
