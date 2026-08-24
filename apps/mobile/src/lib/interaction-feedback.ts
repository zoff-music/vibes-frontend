import { safeWrapAsync } from '@vibes/shared';
import * as Haptics from 'expo-haptics';

export async function triggerSelectionFeedback() {
  await safeWrapAsync(Haptics.selectionAsync());
}
