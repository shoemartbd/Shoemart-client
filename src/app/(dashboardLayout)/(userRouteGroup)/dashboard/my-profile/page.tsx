import MyProfileContent from "@/components/modules/Dashboard/Profile/MyProfileContent";
import { getUserInfo } from "@/services/auth.services";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Shoe Mart Dashboard",
  description: "Manage your profile settings and personal information.",
};

export default async function UserMyProfilePage() {
  const user = await getUserInfo();

  if (!user) {
    return null;
  }

  return <MyProfileContent user={user} />;
}
