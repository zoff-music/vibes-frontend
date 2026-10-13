/** Public files use the same build-time origin and app prefix as Vite assets. */
export function publicAssetUrl(filename: string) {
  return `${import.meta.env.BASE_URL}${filename}`;
}
