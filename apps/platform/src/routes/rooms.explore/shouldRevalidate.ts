import type { ShouldRevalidateFunctionArgs } from '@kasperrt/smolter/preact';
import { readRoomBrowserSearch, roomBrowserUrl } from './utils/search';

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname !== nextUrl.pathname) {
    return defaultShouldRevalidate;
  }

  const currentSearch = readRoomBrowserSearch(new Request(currentUrl));
  const nextSearch = readRoomBrowserSearch(new Request(nextUrl));

  if (roomBrowserUrl(currentSearch) !== roomBrowserUrl(nextSearch)) {
    return true;
  }

  if (
    formAction &&
    new URL(formAction, currentUrl).pathname === '/resources/profile'
  ) {
    return false;
  }

  if (currentUrl.search !== nextUrl.search) {
    return false;
  }

  return defaultShouldRevalidate;
}
