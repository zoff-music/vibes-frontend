interface HowItWorksProps {
  watch?: boolean;
}

// A real sequence, so it keeps its numbers. No widgets: the room demo below is
// the page's one moving moment.
export function HowItWorks({ watch = false }: HowItWorksProps) {
  const steps = [
    { title: 'Make a room.', body: 'A name. A link. You’re in.' },
    {
      title: 'Bring your people.',
      body: 'Share the link, not your headphones.',
    },
    {
      title: watch ? 'Watch it together.' : 'Find your next favourite.',
      body: watch
        ? 'Everyone adds. Everyone watches.'
        : 'Everyone adds. Everyone listens.',
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label={
        watch ? 'Start watching together' : 'Start listening together'
      }
    >
      <ol className="grid gap-6 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="font-pixel dark:text-secondary pt-1 text-xs text-cyan-800"
            >
              {index + 1}
            </span>
            <div>
              <h2 className="font-pixel text-xl normal-case">{step.title}</h2>
              <p className="text-theme-muted mt-2 text-sm">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
