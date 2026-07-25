import { route } from '@react-router/dev/routes';

export default [
  route('admin', './routes/admin/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
];
