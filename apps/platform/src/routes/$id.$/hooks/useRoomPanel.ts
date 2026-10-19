import {
  useNavigate,
  useParams,
  useURLLocation,
} from '@kasperrt/smolter/preact';
import { useCallback } from 'preact/hooks';
import { type RoomPanel, roomPanel } from '../utils/roomPanel';

export function useRoomPanel() {
  const params = useParams();
  const location = useURLLocation();
  const navigate = useNavigate();
  const panel = roomPanel(params['*']);
  const href = useCallback(
    (next: RoomPanel) => {
      const url = new URL(
        typeof window === 'undefined' ? location.href : window.location.href,
      );
      url.pathname = `/${encodeURIComponent(params.id ?? '')}${next ? `/${next}` : ''}`;

      return `${url.pathname}${url.search}${url.hash}`;
    },
    [location.href, params.id],
  );
  const open = useCallback(
    (next: RoomPanel) => {
      void navigate(href(next), {
        replace: true,
        preventScrollReset: true,
        viewTransition: false,
      });
    },
    [href, navigate],
  );
  return { panel, open, href };
}
