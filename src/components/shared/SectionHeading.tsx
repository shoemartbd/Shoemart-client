import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-3",
        isCenter ? "text-center" : "text-left",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3", isCenter && "justify-center")}>
        <span className={cn("h-px w-8", light ? "bg-white/40" : "bg-primary/60")} />
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-[0.3em]",
            light ? "text-white/70" : "text-primary",
          )}
        >
          {eyebrow}
        </span>
        <span className={cn("h-px w-8", light ? "bg-white/40" : "bg-primary/60")} />
      </div>

      <h2
        className={cn(
          "font-serif text-3xl md:text-4xl font-bold tracking-tight",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "text-base md:text-lg max-w-2xl",
            isCenter && "mx-auto",
            light ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
