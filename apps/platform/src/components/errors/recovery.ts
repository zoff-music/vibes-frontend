export function isStaleRouteError(error: Error) {
  return (
    /^No result found for routeId "/.test(error.message) ||
    error.message ===
      'Unable to discover routes due to manifest version mismatch.'
  );
}
