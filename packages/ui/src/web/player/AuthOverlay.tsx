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
    <div className="animate-fade-in absolute inset-0 z-999 flex items-center justify-center rounded-2xl bg-black/95 backdrop-blur-sm">
      <div className="border-primary bg-paper shadow-auth dark:bg-dark-background mx-4 max-w-sm rounded-4xl border-5 p-10 text-center">
        <h3 className="text-text mb-2 text-xl font-black tracking-tight dark:text-white">
          {errorMessage ? 'ACCESS RESTRICTED' : 'AUTHENTICATION REQUIRED'}
        </h3>
        <p className="text-text-muted mb-8 text-sm leading-relaxed dark:text-white/70">
          {errorMessage && errorMessage}
          {!errorMessage && (
            <>
              Connect to{' '}
              <span className="text-primary font-bold capitalize">
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
    </div>
  );
}
