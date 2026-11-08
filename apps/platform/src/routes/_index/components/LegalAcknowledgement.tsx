import { Link } from '@kasperrt/smolter/preact';

export function LegalAcknowledgement() {
  return (
    <p className="text-caption text-theme-muted max-w-sm leading-relaxed">
      By continuing, you agree to the{' '}
      <Link
        className="text-theme-muted decoration-theme hover:text-theme focus-visible:ring-secondary cursor-pointer underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        to="/terms-of-service"
      >
        Terms
      </Link>{' '}
      and{' '}
      <Link
        className="text-theme-muted decoration-theme hover:text-theme focus-visible:ring-secondary cursor-pointer underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        to="/privacy-policy"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
