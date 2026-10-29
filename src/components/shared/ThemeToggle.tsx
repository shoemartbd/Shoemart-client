"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  iconClassName = "h-[1.2rem] w-[1.2rem]",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-all duration-300 hover:bg-primary/10",
        className,
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      <Sun
        className={cn(
          "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500",
          iconClassName,
        )}
      />
      <Moon
        className={cn(
          "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400",
          iconClassName,
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
