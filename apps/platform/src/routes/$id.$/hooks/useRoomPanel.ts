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
  const chatOpen =
    params['*'] === 'chat' || Boolean(params['*']?.startsWith('chat/'));
  const href = useCallback(
    (next: RoomPanel, preserveChat = true) => {
      const url = new URL(
        typeof window === 'undefined' ? location.href : window.location.href,
      );
      const prefix = chatOpen && preserveChat && next !== 'chat' ? '/chat' : '';
      url.pathname = `/${encodeURIComponent(params.id ?? '')}${prefix}${next ? `/${next}` : ''}`;

      return `${url.pathname}${url.search}${url.hash}`;
    },
    [location.href, params.id, chatOpen],
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
