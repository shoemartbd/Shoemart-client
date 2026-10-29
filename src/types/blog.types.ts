export interface IBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  author: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogFormValues {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  isPublished: boolean;
}

export interface ICreateBlogPayload {
  title: string;
  excerpt?: string;
  content: string;
  author?: string;
  isPublished: boolean;
}

export interface IUpdateBlogPayload {
  title?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  isPublished?: boolean;
}
