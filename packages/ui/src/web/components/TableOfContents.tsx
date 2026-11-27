import { useNavigate, useURLLocation } from '@kasperrt/smolter/preact';
import { classNames } from '@vibes/shared';
import { useEffect, useState } from 'preact/compat';

interface SectionLink {
  id: string;
  label: string;
  count?: number;
}

interface TableOfContentsProps {
  items: SectionLink[];
  label: string;
  className?: string;
  showLabel?: boolean;
}

export function TableOfContents({
  items,
  label,
  className,
  showLabel,
}: TableOfContentsProps) {
  const navigate = useNavigate();
  const activeId = useActiveSection(items);
  return (
    <nav aria-label={label} className={className}>
      {showLabel && (
        <p className="font-pixel text-theme-subtle mb-3 px-3 text-xs">
          {label}
        </p>
      )}
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {items.map((topic) => {
          const visible = topic.count !== 0;

          return (
            <li key={topic.id}>
              <a
                href={`#${topic.id}`}
                {...(!visible && { 'aria-disabled': true, tabIndex: -1 })}
                {...(visible &&
                  activeId === topic.id && {
                    'aria-current': 'location' as const,
                  })}
                onClick={(event) => {
                  if (!visible) {
                    event.preventDefault();
                    return;
                  }
                  if (
                    event.button !== 0 ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  const target = document.getElementById(topic.id);
                  if (!target) return;
                  event.preventDefault();
                  const hash = `#${topic.id}`;
                  if (location.hash !== hash)
                    navigate({ hash }, { preventScrollReset: true });
                  target.focus({ preventScroll: true });
                  target.scrollIntoView({
                    behavior: matchMedia('(prefers-reduced-motion: reduce)')
                      .matches
                      ? 'instant'
                      : 'smooth',
                    block: 'start',
                  });
                }}
                className={classNames(
                  'flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:rounded-xl aria-[current=location]:border-secondary aria-[current=location]:bg-secondary/10 aria-[current=location]:font-semibold',
                  visible
                    ? 'border-theme text-theme hover:bg-theme-surface'
                    : 'pointer-events-none border-theme text-theme-subtle opacity-60',
                )}
              >
                {topic.label}
                {topic.count !== undefined && (
                  <span className="text-theme-muted text-xs tabular-nums">
                    {topic.count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function useActiveSection(items: SectionLink[]) {
  const { hash } = useURLLocation();
  const [activeId, setActiveId] = useState<string | null>(
    items.find((item) => item.count !== 0)?.id ?? null,
  );

  useEffect(() => {
    const sections = items.flatMap(({ id }) => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });
    let frame = 0;
    function update() {
      frame = 0;
      const atBottom =
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 1;
      const readingLine = sections[0]
        ? Number.parseFloat(getComputedStyle(sections[0]).scrollMarginTop) + 1
        : 0;
      let current: HTMLElement | undefined = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break;
        current = section;
      }
      // Short final sections can reach the bottom before their heading aligns.
      if (atBottom) {
        const target = sections.find((section) => `#${section.id}` === hash);
        current =
          target && target.getBoundingClientRect().top >= readingLine - 2
            ? target
            : sections.at(-1);
      }
      setActiveId(current?.id ?? null);
    }
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    const observer = new ResizeObserver(scheduleUpdate);
    for (const section of sections) observer.observe(section);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [items, hash]);

  return activeId;
}
