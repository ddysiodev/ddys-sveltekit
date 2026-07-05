export type DdysPrimitive = string | number | boolean | null | undefined;
export type DdysQuery = Record<string, DdysPrimitive | DdysPrimitive[]>;

export interface DdysApiResponse<T = unknown> {
  success?: boolean;
  code?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DdysPaginated<T = unknown> {
  data: T[];
  meta: Record<string, unknown>;
}

export interface DdysMovie {
  id?: string | number;
  slug?: string;
  title?: string;
  name?: string;
  poster?: string;
  cover?: string;
  year?: string | number;
  type?: string;
  genre?: string | string[];
  region?: string | string[];
  rating?: string | number;
  description?: string;
  summary?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface DdysSource {
  name?: string;
  label?: string;
  url?: string;
  type?: string;
  [key: string]: unknown;
}

export interface DdysRequestInput {
  title: string;
  year?: string | number;
  type?: string;
  doubanId?: string;
  douban_id?: string;
  imdbId?: string;
  imdb_id?: string;
  note?: string;
  description?: string;
  contact?: string;
  token?: string;
  honeypot?: string;
  [key: string]: unknown;
}

export type DdysViewName = 'movies' | 'latest' | 'hot' | 'search' | 'suggest' | 'calendar' | 'movie' | 'sources' | 'related' | 'comments' | 'collections' | 'collection' | 'shares' | 'share' | 'requests' | 'activities' | 'user' | 'types' | 'genres' | 'regions';
