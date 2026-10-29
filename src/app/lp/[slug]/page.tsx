import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getLandingPageBySlug } from "@/services/landingPage.services";
import { getSiteSettings } from "@/services/siteSetting.services";
import { stripHtml } from "@/lib/utils";
import LandingPageView from "./_components/LandingPageView";
import GtmScript from "@/components/shared/GtmScript";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getLandingPageBySlug(slug);
    const landingPage = res?.data;
    if (!landingPage) return { title: "Page Not Found" };

    return {
      title: landingPage.campaignTitle,
      description: landingPage.campaignShortDescription
        ? stripHtml(landingPage.campaignShortDescription)
        : undefined,
    };
  } catch {
    return { title: "Page Not Found" };
  }
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params;

  let landingPage = null;
  try {
    const res = await getLandingPageBySlug(slug);
    landingPage = res?.data ?? null;
  } catch {
    landingPage = null;
  }

  if (!landingPage) {
    notFound();
  }

  let siteSettings = null;
  try {
    const res = await getSiteSettings();
    siteSettings = res?.data ?? null;
  } catch {
    siteSettings = null;
  }

  return (
    <>
      <GtmScript />
      <LandingPageView landingPage={landingPage} siteSettings={siteSettings} />
    </>
  );
}
