"use client";

import { FileText } from "lucide-react";
import CmsContentPage from "@/components/shared/CmsContentPage";

export default function TermsPage() {
  return (
    <CmsContentPage
      slug="terms-and-conditions"
      eyebrow="Rules & Regulations"
      icon={FileText}
    />
  );
}
