"use client";

import { Sparkles } from "lucide-react";
import CmsContentPage from "@/components/shared/CmsContentPage";

export default function AboutPage() {
  return <CmsContentPage slug="about-us" eyebrow="Our Story" icon={Sparkles} />;
}
