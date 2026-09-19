import type { RoomMessage } from '@vibes/models';

export function formatChatMessage(message: RoomMessage): string {
  if (message.kind === 'added') return `added ${message.text}`;
  if (message.kind === 'voted') return `voted for ${message.text}`;
  if (message.kind === 'skipped') return `skipped ${message.text}`;
  if (message.kind === 'skipvoted') return `voted to skip ${message.text}`;
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

// createdAt is UTC epoch milliseconds; Date reads the device's local timezone.
export function formatChatTime(createdAt: number): string {
  const date = new Date(createdAt);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
