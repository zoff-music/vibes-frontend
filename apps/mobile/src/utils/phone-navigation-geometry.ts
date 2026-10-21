export function getPhoneNavigationGeometry(
  bottomInset: number,
  height: number,
) {
  const bottom = bottomInset + 12;
  return { bottom, clearance: bottom + height + 8 };
}
