"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function Barcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: 1.5,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 0,
      });
    } catch {
      // invalid characters for the selected format — leave the svg empty
    }
  }, [value]);

  if (!value) {
    return <span className="text-xs text-muted-foreground italic">No SKU</span>;
  }

  return <svg ref={svgRef} />;
}
