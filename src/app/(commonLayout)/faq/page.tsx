"use client";

import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicFaqs } from "@/services/faq.services";

export default function FaqPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => getPublicFaqs(),
  });

  const faqs = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <section className="relative py-20 bg-white dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">
              Support Center
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about shopping on Shoe Mart.
          </p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-slate-100 dark:border-slate-800 rounded-[2rem] px-6 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-6 font-bold text-slate-800 dark:text-slate-200 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
            <HelpCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="font-black text-lg text-slate-800 dark:text-slate-200">
              No FAQs available
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Check back later for answers to common questions.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
