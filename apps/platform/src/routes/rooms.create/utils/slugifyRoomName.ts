export function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '');
}
