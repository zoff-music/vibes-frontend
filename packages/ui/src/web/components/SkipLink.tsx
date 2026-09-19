interface SkipLinkProps {
  href: string;
}

export function SkipLink({ href }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only rounded-xl bg-theme-surface px-5 py-3 font-pixel text-sm text-theme shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:outline-none focus:ring-2 focus:ring-secondary"
    >
      Skip to content
    </a>
  );
}
