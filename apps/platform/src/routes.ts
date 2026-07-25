import { index, route } from '@react-router/dev/routes';

export default [
  index('./routes/_index/route.tsx'),
  route('.well-known/security.txt', './routes/security-txt/loader.ts'),
  route('privacy-policy', './routes/privacy-policy/route.tsx'),
  route('security', './routes/security/route.tsx'),
  route('terms-of-service', './routes/terms-of-service/route.tsx'),
  route('rooms/create', './routes/rooms.create/route.tsx'),
  route('rooms/:id', './routes/rooms.$id/route.tsx'),
  route('callback', './routes/callback/route.tsx'),
  route(':id', './routes/rooms.alias/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
];
