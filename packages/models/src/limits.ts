export const roomNameMaxLength = 100;
export const displayNameMaxLength = 30;
export const chatMessageMaxLength = 500;
export const generatedPlaylistPromptMaxLength = 300;

export function limitRoomEntry(value: string, aiMode: boolean): string {
  const limit = aiMode ? generatedPlaylistPromptMaxLength : roomNameMaxLength;
  if (value.length <= limit) return value;

  // HTML and native input limits count UTF-16 units. Keep emoji pairs intact.
  const lastUnit = value.charCodeAt(limit - 1);
  const end = lastUnit >= 0xd800 && lastUnit <= 0xdbff ? limit - 1 : limit;
  return value.slice(0, end);
}
