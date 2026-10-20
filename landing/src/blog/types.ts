import type { ReactNode } from 'react';

export type BlogCategory =
  | 'Engineering & Psets'
  | 'Linear Algebra'
  | 'Calculus & Derivations'
  | 'University Hubs (US/UK/Canada/DACH/India)'
  | 'General & Tips'
  | 'Guides'
  | (string & {});

export type GeoRegion = 'US' | 'UK' | 'Canada' | 'DACH' | 'India' | 'Global' | (string & {});

export interface TocItem {
  id: string;
  title: string;
  level?: 2 | 3;
}

export interface Author {
  name: string;
  role?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  geoRegion?: GeoRegion | string;
  keywords: string[];
  readTime: string;
  publishedAt: string;
  subtitle?: string;
  author?: Author;
  tableOfContents?: TocItem[];
  relatedSlugs?: string[];
  content: ReactNode;
}
