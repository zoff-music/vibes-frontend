export function isStaleRouteError(error: Error) {
  return (
    /^No result found for routeId "/.test(error.message) ||
    error.message ===
      'Unable to discover routes due to manifest version mismatch.' ||
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
      error.message,
    )
  );
}
