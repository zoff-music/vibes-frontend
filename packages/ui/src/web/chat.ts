import { chatNameColorIndex } from '../shared/chat';

const nameColors = [
  'text-sky-300 [.theme-light_&]:text-sky-700',
  'text-violet-300 [.theme-light_&]:text-violet-700',
  'text-amber-200 [.theme-light_&]:text-amber-800',
  'text-emerald-300 [.theme-light_&]:text-emerald-700',
  'text-pink-300 [.theme-light_&]:text-pink-700',
];

export function chatNameColor(userId: string): string {
  return nameColors[chatNameColorIndex(userId)];
}
