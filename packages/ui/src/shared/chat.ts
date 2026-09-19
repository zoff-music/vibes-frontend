import type { RoomMessage } from '@vibes/models';

export function formatChatMessage(message: RoomMessage): string {
  if (message.kind === 'added') return `added ${message.text}`;
  if (message.kind === 'voted') return `voted for ${message.text}`;
  if (message.kind === 'deleted') return `deleted ${message.text}`;
  if (message.kind === 'renamed')
    return `changed their name to ${message.text}`;
  return message.text;
}

export function chatNameColorIndex(userId: string): number {
  let hash = 0;
  for (const character of userId)
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(hash) % 5;
}
