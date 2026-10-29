"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IBlog } from "@/types/blog.types";

export const getAllBlogs = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IBlog[]>("/blogs", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

export const getPublicBlogs = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IBlog[]>("/blogs", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching public blogs:", error);
    throw error;
  }
};

export const getAdminBlogs = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IBlog[]>("/blogs/admin", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    throw error;
  }
};

export const getBlogBySlug = async (slug: string) => {
  try {
    return await httpClient.get<IBlog>(`/blogs/slug/${slug}`);
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    throw error;
  }
};

export const getBlogById = async (id: string) => {
  try {
    return await httpClient.get<IBlog>(`/blogs/${id}`);
  } catch (error) {
    console.error("Error fetching blog by id:", error);
    throw error;
  }
};

export const createBlog = async (formData: FormData) => {
  try {
    return await httpClient.post<IBlog>("/blogs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

export const updateBlog = async (id: string, formData: FormData) => {
  try {
    return await httpClient.patch<IBlog>(`/blogs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const deleteBlog = async (id: string) => {
  try {
    return await httpClient.delete<IBlog>(`/blogs/${id}`);
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};
