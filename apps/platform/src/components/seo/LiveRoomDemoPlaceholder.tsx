// Mirrors LiveRoomDemo's geometry so the deferred demo does not shift the page.
export function LiveRoomDemoPlaceholder() {
  return (
    <div aria-hidden="true">
      <div className="border-theme bg-theme @container rounded-3xl border p-2 shadow-lg sm:p-4">
        <div className="border-theme bg-theme-surface h-13 rounded-full border" />
        <div className="mt-3 grid gap-4 sm:mt-4 @3xl:grid-cols-5 @3xl:gap-6">
          <div className="flex flex-col gap-4 @3xl:col-span-3">
            <div className="rounded-player aspect-video bg-black @3xl:aspect-[6/5]" />
            <div className="h-14" />
          </div>
          <div className="h-104 sm:h-120 @3xl:col-span-2 @3xl:h-auto" />
        </div>
      </div>
      <div className="mt-3 h-11" />
    </div>
  );
}
