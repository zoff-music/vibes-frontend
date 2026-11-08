interface SkipLinkProps {
  href: string;
}

export function SkipLink({ href }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="bg-theme-surface font-pixel text-theme focus:ring-secondary sr-only rounded-xl px-5 py-3 text-sm shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:ring-2 focus:outline-none"
    >
      Skip to content
    </a>
  );
}
