interface Props {
  count: number;
}

export function ListenerCount({ count }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex h-11 items-center gap-1.5 rounded-xl border border-theme bg-theme-surface px-3 text-theme">
      <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
      <span className="text-[10px] tracking-[0.2em]">
        <span className="sm:hidden">{count}</span>
        <span className="hidden sm:inline">
          {count} {count === 1 ? 'Listener' : 'Listeners'}
        </span>
      </span>
    </div>
  );
}
