import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface HomeActionData {
  roomCode: string;
  roomExists: boolean;
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<HomeActionData> {
  const formData = await request.formData();
  const rawRoomCode = String(formData.get('roomCode') ?? '');
  const roomCode = rawRoomCode.trim().toLowerCase().replace(/\s+/g, '-');
  if (!roomCode) {
    return {
      roomCode,
      roomExists: false,
    };
  }

  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [err] = await serverApi.get(
    '/rooms/{id}',
    { id: roomCode },
    { headers: requestHeaders },
  );

  return {
    roomCode,
    roomExists: !err,
  };
}
