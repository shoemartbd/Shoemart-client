import { ILandingPage } from "@/types/landingPage.types";
import { LANDING_PAGE_SECTION_EYEBROWS } from "@/lib/landingPageSections";
import ImageSlider from "./ImageSlider";

export const proseClass =
  "[&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:font-bold [&>a]:text-primary [&>a]:underline [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>blockquote]:border-l-2 [&>blockquote]:pl-3 [&>blockquote]:italic";

export const getEmbedUrl = (url?: string | null) => {
  if (!url) return "";

  if (url.includes("youtube.com/shorts/")) {
    const id = url.split("youtube.com/shorts/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/watch")) {
    try {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    } catch {
      return url;
    }
  }
  if (url.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
  }
  return url;
};

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-primary/60" />
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{label}</span>
      <span className="h-px w-8 bg-primary/60" />
    </div>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />;
}

interface SectionProps {
  landingPage: ILandingPage;
}

export function GallerySection({ landingPage }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionDivider />
      <div className="bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent rounded-[2rem] py-4 space-y-6">
        {(landingPage.galleryHeading || landingPage.galleryDescription) && (
          <div className="text-center space-y-3">
            <SectionEyebrow label={LANDING_PAGE_SECTION_EYEBROWS.gallery} />
            {landingPage.galleryHeading && (
              <h2 className="text-2xl md:text-3xl font-bold font-serif">
                {landingPage.galleryHeading}
              </h2>
            )}
            {landingPage.galleryDescription && (
              <div
                className={`text-muted-foreground ${proseClass}`}
                dangerouslySetInnerHTML={{ __html: landingPage.galleryDescription }}
              />
            )}
          </div>
        )}
        <div className="rounded-[2rem] ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] bg-card p-4 md:p-6">
          <ImageSlider images={landingPage.galleryImages} alt="Gallery" />
        </div>
      </div>
    </div>
  );
}

export function AboutSection({ landingPage }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionDivider />
      <div className="bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent rounded-[2rem] py-4 space-y-6">
        <SectionEyebrow label={LANDING_PAGE_SECTION_EYEBROWS.about} />
        {landingPage.aboutHeading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center font-serif">
            {landingPage.aboutHeading}
          </h2>
        )}
        <div className="flex flex-col md:flex-row items-center gap-8">
          {landingPage.aboutDescription && (
            <div
              className={`${landingPage.videoUrl ? "md:w-1/2" : "w-full text-center"} text-muted-foreground text-lg leading-relaxed ${proseClass}`}
              dangerouslySetInnerHTML={{ __html: landingPage.aboutDescription }}
            />
          )}
          {landingPage.videoUrl && (
            <div className="md:w-1/2 w-full aspect-video rounded-[2rem] overflow-hidden ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
              <iframe
                src={getEmbedUrl(landingPage.videoUrl)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DescriptionSection({ landingPage }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionDivider />
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <SectionEyebrow label={LANDING_PAGE_SECTION_EYEBROWS.description} />
        {landingPage.descriptionTitle && (
          <h2 className="text-2xl md:text-3xl font-bold font-serif">
            {landingPage.descriptionTitle}
          </h2>
        )}
        {landingPage.description && (
          <div
            className={`bg-card ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] rounded-[2rem] p-6 md:p-10 text-left text-muted-foreground leading-relaxed ${proseClass}`}
            dangerouslySetInnerHTML={{ __html: landingPage.description }}
          />
        )}
      </div>
    </div>
  );
}

export function ReviewsSection({ landingPage }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionDivider />
      <div className="bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent rounded-[2rem] py-4 space-y-6">
        <div className="text-center space-y-3">
          <SectionEyebrow label={LANDING_PAGE_SECTION_EYEBROWS.reviews} />
          {landingPage.reviewHeading && (
            <h2 className="text-2xl md:text-3xl font-bold font-serif">
              {landingPage.reviewHeading}
            </h2>
          )}
        </div>
        <div className="rounded-[2rem] ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] bg-card p-4 md:p-6">
          <ImageSlider images={landingPage.reviewImages} alt="Review" />
        </div>
      </div>
    </div>
  );
}
