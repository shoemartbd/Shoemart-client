import UserReviewTable from "@/components/modules/User/Review/UserReviewTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reviews | Dashboard",
  description: "Manage your product reviews",
};

export default function MyReviewsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          My Product Reviews
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <UserReviewTable />
      </div>
    </div>
  );
}
