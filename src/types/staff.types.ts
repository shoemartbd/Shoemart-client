export interface IPermissionGroup {
  group: string;
  permissions: { key: string; label: string }[];
}

export interface IStaffRole {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export interface IStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  image?: string | null;
  createdAt: string;
  staffRole: { id: string; name: string } | null;
}
