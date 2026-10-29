import { ShieldCheck } from "lucide-react";
import { CmsPageContent } from "@/components/shared/CmsContentPage";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative py-20 bg-white dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[80px] translate-y-1/3 translate-x-1/3" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">Privacy Protection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Your trust is our most valuable asset. Learn how we collect, store, safeguard, and use your data.
          </p>
          <div className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Last Updated: May 22, 2026
          </div>
        </div>
      </section>

      {/* CMS-Backed Privacy Details */}
      <section className="py-16 container mx-auto px-6 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          <CmsPageContent slug="privacy-policy" titleClassName="mb-8" />
        </div>
      </section>
    </div>
  );
}
