import { Link } from 'react-router';

export function LegalFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-3">
      <div className="panel-surface flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-theme px-5 py-2 text-center text-theme-subtle text-xs shadow-lg backdrop-blur">
        <span>By using Zoff, you agree to the</span>
        <Link
          className="cursor-pointer text-theme-muted underline underline-offset-4 transition-colors hover:text-theme"
          to="/terms-of-service"
        >
          Terms of Service
        </Link>
        <span>and acknowledge the</span>
        <Link
          className="cursor-pointer text-theme-muted underline underline-offset-4 transition-colors hover:text-theme"
          to="/privacy-policy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
