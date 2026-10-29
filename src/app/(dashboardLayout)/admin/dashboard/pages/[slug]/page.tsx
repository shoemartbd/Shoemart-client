import { notFound } from "next/navigation";
import { getPageContent } from "@/services/pageContent.services";
import PageContentForm from "./_components/PageContentForm";

const KNOWN_SLUGS = [
  "about-us",
  "terms-and-conditions",
  "privacy-policy",
  "refund-policy",
] as const;

const PAGE_LABELS: Record<(typeof KNOWN_SLUGS)[number], string> = {
  "about-us": "About Us",
  "terms-and-conditions": "Terms and Conditions",
  "privacy-policy": "Privacy Policy",
  "refund-policy": "Refund Policy",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PageContentEditPage({ params }: Props) {
  const { slug } = await params;

  if (!KNOWN_SLUGS.includes(slug as (typeof KNOWN_SLUGS)[number])) {
    notFound();
  }

  const knownSlug = slug as (typeof KNOWN_SLUGS)[number];

  let pageContent = null;
  try {
    const res = await getPageContent(knownSlug);
    pageContent = res?.data ?? null;
  } catch {
    pageContent = null;
  }

  if (!pageContent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">{PAGE_LABELS[knownSlug]}</h3>
        <p className="text-muted-foreground">
          Update the title and content shown on this storefront page.
        </p>
      </div>

      <PageContentForm slug={knownSlug} pageContent={pageContent} />
    </div>
  );
}
