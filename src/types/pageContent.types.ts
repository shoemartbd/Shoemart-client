export interface IPageContent {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface IUpdatePageContentPayload {
  title: string;
  content: string;
}
