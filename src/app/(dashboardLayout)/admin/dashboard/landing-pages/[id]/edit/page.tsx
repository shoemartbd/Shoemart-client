import { notFound } from "next/navigation";
import { getLandingPageById } from "@/services/landingPage.services";
import LandingPageForm from "../../_components/LandingPageForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLandingPagePage({ params }: Props) {
  const { id } = await params;

  let landingPage = null;
  try {
    const res = await getLandingPageById(id);
    landingPage = res?.data ?? null;
  } catch {
    landingPage = null;
  }

  if (!landingPage) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Edit Landing Page</h3>
        <p className="text-muted-foreground">
          Update your campaign content. Changes go live immediately.
        </p>
      </div>

      <LandingPageForm mode="edit" landingPage={landingPage} />
    </div>
  );
}
