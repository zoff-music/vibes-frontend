export function slugifyRoomName(name: string): string {
  const trimmedName = name.trim();
  if (
    Array.from(trimmedName).some((character) => character.charCodeAt(0) > 127)
  ) {
    return Array.from(
      trimmedName,
      (character) => `u${character.codePointAt(0)?.toString(16)}`,
    ).join('-');
  }

  return trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '');
}
