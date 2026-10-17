interface DeferredModalLoadingProps {
  label: string;
}

export function DeferredModalLoading({ label }: DeferredModalLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="panel-strong flex items-center gap-3 rounded-2xl border border-theme px-5 py-4 text-theme shadow-2xl"
        role="status"
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme border-t-primary" />
        <span className="font-pixel text-theme-muted text-xs">{label}</span>
      </div>
    </div>
  );
}
