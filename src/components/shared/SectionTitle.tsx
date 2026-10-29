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
        "text-2xl font-bold tracking-tight text-foreground md:text-3xl",
        className,
      )}
    >
      <TypewriterText text={title} />
    </h2>
  );
}
