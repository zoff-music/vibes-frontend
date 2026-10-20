import {
  useNavigate,
  useParams,
  useURLLocation,
} from '@kasperrt/smolter/preact';
import { useCallback } from 'preact/hooks';
import { type RoomPanel, roomPanel } from '../utils/roomPanel';

export function useRoomPanel(roomId?: string, minimized = false) {
  const params = useParams();
  const location = useURLLocation();
  const navigate = useNavigate();
  const panel = minimized ? '' : roomPanel(params['*']);
  const chatOpen =
    !minimized &&
    (params['*'] === 'chat' || Boolean(params['*']?.startsWith('chat/')));
  const href = useCallback(
    (next: RoomPanel, preserveChat = true) => {
      const url = new URL(
        typeof window === 'undefined' ? location.href : window.location.href,
      );
      const prefix = chatOpen && preserveChat && next !== 'chat' ? '/chat' : '';
      url.pathname = `/${encodeURIComponent(roomId ?? params.id ?? '')}${prefix}${next ? `/${next}` : ''}`;

      return `${url.pathname}${url.search}${url.hash}`;
    },
    [location.href, params.id, roomId, chatOpen],
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
  return { panel, open, href, chatOpen };
}
