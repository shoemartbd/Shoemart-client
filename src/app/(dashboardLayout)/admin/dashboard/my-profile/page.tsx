import MyProfileContent from "@/components/modules/Dashboard/Profile/MyProfileContent";
import { getUserInfo } from "@/services/auth.services";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Admin Dashboard",
  description: "Manage your admin profile settings on Shoe Mart.",
};

export default async function AdminMyProfilePage() {
  const user = await getUserInfo();

  if (!user) {
    return null;
  }

  return <MyProfileContent user={user} />;
}
