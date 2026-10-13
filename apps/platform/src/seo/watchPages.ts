import { page as cinema } from './pages/cinema';
import { page as videos } from './pages/videos';
import { page as watching } from './pages/watching';

import type { ProductPage } from './productPages';

export const watchPages: ProductPage[] = [watching, cinema, videos];
