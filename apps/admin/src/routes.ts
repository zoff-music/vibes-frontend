import { index, route } from '@react-router/dev/routes';

export default [
  route('admin', './routes/admin/route.tsx', [
    index('./routes/admin/overview/route.tsx'),
    route('rooms', './routes/admin/rooms/route.tsx'),
    route('users', './routes/admin/users/route.tsx'),
  ]),
  route('*', './routes/not-found/route.tsx'),
];
