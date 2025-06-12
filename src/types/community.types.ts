export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface IComment {
  id: string;
  cardId: string;
  userId: IUser;
  description: string;
  createdAt: string;
}

export interface ICard {
  id: string;
  title: string;
  priority?: string;
  image_url?: string[];
  downloads: number;
  likes: number;
  comments: IComment[] | number; // backend may return array or number
  createdAt?: string;
  userId?: IUser; // populated on feed
  is_published?: boolean;
  // Helpers
  likedByUser?: boolean;
  pdfs?: {
    url: string;
    filename: string;
    uploaded_at: string;
    size_kb?: number;
  }[];
  content?: string;
}

// Generic API response wrappers
export interface ApiSuccess<T> {
  status: 'success';
  data: T;
  message?: string;
}

export type Paginated<T> = {
  results: T[];
  page: number;
  hasNextPage: boolean;
};
