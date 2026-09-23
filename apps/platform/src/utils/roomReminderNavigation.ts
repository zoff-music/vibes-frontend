interface ReminderNavigation {
  navigationType: string;
  origin: string;
  referrer: string;
}

export function canOfferRoomReminder({
  navigationType,
  origin,
  referrer,
}: ReminderNavigation) {
  if (navigationType === 'back_forward') return false;
  if (!referrer) return true;
  const previousPage = new URL(referrer);
  return previousPage.origin !== origin || previousPage.pathname === '/';
}

export function isInternalDeparture(
  currentUrl: string,
  destinationUrl: string,
) {
  const current = new URL(currentUrl);
  const destination = new URL(destinationUrl, current);
  return (
    destination.origin === current.origin &&
    destination.pathname !== current.pathname
  );
}
