import { page as apps } from './pages/apps';
import { page as listening } from './pages/listening';
import { page as queue } from './pages/queue';
import { page as rooms } from './pages/rooms';

export interface ProductSection {
  title: string;
  body: string;
  points?: string[];
}

export interface ProductPage {
  slug: string;
  label: string;
  title: string;
  description: string;
  heading: string;
  accent?: string;
  introduction: string;
  actionLabel: string;
  sections: ProductSection[];
}

export const productPages: ProductPage[] = [listening, queue, rooms, apps];
