"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessReturnDialog from "./ProcessReturnDialog";

export default function NewReturnButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 gap-2 rounded-xl px-5 font-bold shadow-lg shadow-primary/20"
      >
        <RotateCcw className="size-4" />
        New Return
      </Button>
      {/* Mounted per open so each return starts from a clean search */}
      {open && <ProcessReturnDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
