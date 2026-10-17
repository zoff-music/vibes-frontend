// Resolve automatic mode before CSS paints, including Tailwind dark variants.
if (
  !document.documentElement.classList.contains('theme-light') &&
  !document.documentElement.classList.contains('dark') &&
  matchMedia('(prefers-color-scheme: dark)').matches
) {
  document.documentElement.classList.add('dark');
}
