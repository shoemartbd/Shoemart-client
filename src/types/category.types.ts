export interface ICategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  parent?: ICategory;
  subcategories?: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCategoryPayload {
  name: string;
  parentId?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  parentId?: string;
  isActive?: boolean;
}
