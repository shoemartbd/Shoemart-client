import { cn } from "@/lib/utils";
import TypewriterText from "./TypewriterText";

// Homepage product section heading (Top Selling, Trending, All Products, ...)
export default function SectionTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-lg font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl",
        className,
      )}
    >
      <TypewriterText text={title} />
    </h2>
  );
}
