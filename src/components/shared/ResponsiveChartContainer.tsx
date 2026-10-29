"use client";

import { useEffect, useState, ComponentProps } from "react";
import { ResponsiveContainer } from "recharts";

type ResponsiveChartContainerProps = ComponentProps<typeof ResponsiveContainer>;

export function ResponsiveChartContainer({
  children,
  width = "100%",
  height = "100%",
  minWidth = 0,
  minHeight = 0,
  ...props
}: ResponsiveChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full min-h-[200px]" />;
  }

  return (
    <ResponsiveContainer
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

export default ResponsiveChartContainer;
