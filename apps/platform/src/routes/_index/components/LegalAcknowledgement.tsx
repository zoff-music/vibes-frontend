import { Link } from 'react-router';

export function LegalAcknowledgement() {
  return (
    <p className="mt-4 text-center text-theme-subtle text-xs leading-relaxed">
      By continuing, you agree to the{' '}
      <Link
        className="cursor-pointer text-theme-muted underline decoration-theme underline-offset-4 transition-colors hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        to="/terms-of-service"
      >
        Terms
      </Link>{' '}
      and{' '}
      <Link
        className="cursor-pointer text-theme-muted underline decoration-theme underline-offset-4 transition-colors hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        to="/privacy-policy"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
