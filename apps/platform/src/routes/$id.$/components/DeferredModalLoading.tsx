interface DeferredModalLoadingProps {
  label: string;
}

export function DeferredModalLoading({ label }: DeferredModalLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="panel-strong border-theme text-theme flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl"
        role="status"
      >
        <div className="border-theme border-t-primary h-5 w-5 animate-spin rounded-full border-2" />
        <span className="font-pixel text-theme-muted text-xs">{label}</span>
      </div>
    </div>
  );
}
