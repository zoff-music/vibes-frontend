import { useEffect } from 'react';

export function useSpatialNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = getDirection(event.key);
      if (!direction) return;
      const candidates = getFocusableElements();
      if (candidates.length === 0) return;
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) {
        candidates[0]?.focus();
        return;
      }
      const nextElement = findNextElement(activeElement, candidates, direction);
      if (!nextElement) return;
      event.preventDefault();
      nextElement.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

type Direction = 'down' | 'left' | 'right' | 'up';

function getDirection(key: string): Direction | null {
  if (key === 'ArrowDown') return 'down';
  if (key === 'ArrowLeft') return 'left';
  if (key === 'ArrowRight') return 'right';
  if (key === 'ArrowUp') return 'up';
  return null;
}

function getFocusableElements() {
  const elements = document.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
  );
  return [...elements].filter((element) => element.offsetParent !== null);
}

function findNextElement(
  activeElement: HTMLElement,
  candidates: HTMLElement[],
  direction: Direction,
) {
  const active = getCenter(activeElement.getBoundingClientRect());
  let closest: HTMLElement | null = null;
  let closestScore = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (candidate === activeElement) continue;
    const center = getCenter(candidate.getBoundingClientRect());
    const horizontalDistance = center.x - active.x;
    const verticalDistance = center.y - active.y;
    if (!isInDirection(horizontalDistance, verticalDistance, direction)) {
      continue;
    }
    const primaryDistance =
      direction === 'left' || direction === 'right'
        ? Math.abs(horizontalDistance)
        : Math.abs(verticalDistance);
    const crossDistance =
      direction === 'left' || direction === 'right'
        ? Math.abs(verticalDistance)
        : Math.abs(horizontalDistance);
    const score = primaryDistance + crossDistance * crossAxisPenalty;
    if (score >= closestScore) continue;
    closest = candidate;
    closestScore = score;
  }
  return closest;
}

function getCenter(rect: DOMRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function isInDirection(
  horizontalDistance: number,
  verticalDistance: number,
  direction: Direction,
) {
  if (direction === 'down') return verticalDistance > 0;
  if (direction === 'left') return horizontalDistance < 0;
  if (direction === 'right') return horizontalDistance > 0;
  return verticalDistance < 0;
}

const crossAxisPenalty = 2;
