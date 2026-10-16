import { route } from '@react-router/dev/routes';

export default [
  route('remotes/disconnect', './routes/disconnect/action.ts'),
  route('remotes/resources/profile', './routes/profile/resource.ts'),
  route('remotes', './routes/pair/redirect.tsx'),
  route('remotes/join', './routes/pair/route.tsx'),
  route('remotes/:id', './routes/controller/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
];
