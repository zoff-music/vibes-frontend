import { index, route } from '@react-router/dev/routes';

export default [
  index('./routes/_index/route.tsx'),
  route('robots.txt', './routes/robots/loader.ts'),
  route('sitemap.xml', './routes/sitemap/loader.ts'),
  route('discovery/:topic', './routes/discover/route.tsx'),
  route('discover/:topic', './routes/discover/redirect.ts'),
  route('.well-known/security.txt', './routes/security-txt/loader.ts'),
  route('privacy-policy', './routes/privacy-policy/route.tsx'),
  route('security', './routes/security/route.tsx'),
  route('terms-of-service', './routes/terms-of-service/route.tsx'),
  route('resources/profile', './routes/profile/route.ts'),
  route('rooms/create', './routes/rooms.create/route.tsx'),
  route('remote-control', './routes/remote-control/route.tsx'),
  route('rooms/:id', './routes/rooms.alias/route.tsx'),
  route('callback', './routes/callback/route.tsx'),
  route(':id', './routes/rooms.$id/route.tsx'),
  route('*', './routes/not-found/route.tsx'),
];
