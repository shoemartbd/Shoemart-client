export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  image?: string;
  emailVerified: boolean;
  createdAt: string;
}

// Lightweight user info used for display in sidebars / navbars
export interface UserInfo {
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  // Staff accounts: the dashboard sections they may open. null = full access.
  permissions?: string[] | null;
  staffRoleName?: string | null;
}
