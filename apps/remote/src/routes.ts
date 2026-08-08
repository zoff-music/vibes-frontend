import { route } from '@react-router/dev/routes';

export default [
  route('remotes', './routes/pair/route.tsx'),
  route('remotes/:id', './routes/controller/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
];
