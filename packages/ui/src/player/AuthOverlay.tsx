import { motion } from 'framer-motion';
import { Button } from '../components/Button';

interface AuthOverlayProps {
  provider: string;
  errorMessage?: string | null;
  onAuthorize: () => void;
}

export function AuthOverlay({
  provider,
  errorMessage,
  onAuthorize,
}: AuthOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-999 flex items-center justify-center rounded-2xl bg-black/95 backdrop-blur-sm"
    >
      <div className="mx-4 max-w-sm rounded-4xl border-5 border-primary bg-paper p-10 text-center shadow-auth dark:bg-dark-background">
        <h3 className="mb-2 font-black text-text text-xl tracking-tight dark:text-white">
          {errorMessage ? 'ACCESS RESTRICTED' : 'AUTHENTICATION REQUIRED'}
        </h3>
        <p className="mb-8 text-sm text-text-muted leading-relaxed dark:text-white/70">
          {errorMessage && errorMessage}
          {!errorMessage && (
            <>
              Connect to{' '}
              <span className="font-bold text-primary capitalize">
                {provider}
              </span>{' '}
              to enable playback in this room.
            </>
          )}
        </p>
        <Button onClick={onAuthorize} variant="primary" className="w-full">
          {errorMessage
            ? 'RETRY CONNECTION'
            : `CONNECT ${provider.toUpperCase()}`}
        </Button>
      </div>
    </motion.div>
  );
}
