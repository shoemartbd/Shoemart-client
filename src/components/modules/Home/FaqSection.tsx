"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/shared/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicFaqs } from "@/services/faq.services";

export default function FaqSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => getPublicFaqs(),
  });

  const faqs = data?.data || [];

  if (!isLoading && faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-10 max-w-4xl mx-auto">
      <SectionHeading
        eyebrow="Support Center"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about shopping on Shoe Mart."
        className="mb-16"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.id}
              value={`item-${i}`}
              className="border rounded-[2rem] px-6 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="hover:no-underline py-6 font-bold text-foreground text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  );
}
