/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle2,
  Factory,
  PackageCheck,
  Phone,
  Send,
  ShoppingBag,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllCategories } from "@/services/category.services";
import WholesaleForm from "./WholesaleForm";
import WholesaleHeroImage from "./WholesaleHeroImage";
import { scrollToWholesaleForm as scrollToForm, WHOLESALE_FORM_ID } from "./wholesaleOptions";

const REASONS = [
  {
    icon: Factory,
    title: "Wholesale Pricing",
    text: "Special rates for bulk orders. The bigger the order, the better the price.",
  },
  {
    icon: Boxes,
    title: "Wide Range, All Sizes",
    text: "Men's, women's and kids' shoes plus accessories, with full size runs.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Checked",
    text: "Every pair is checked before it is packed, so your customers get what they expect.",
  },
  {
    icon: Truck,
    title: "Delivery Across Bangladesh",
    text: "Safe, tracked delivery to your shop or warehouse, anywhere in the country.",
  },
];

const BUYERS = [
  { icon: Store, title: "Retail Shops", text: "Stock your shop with fast-selling styles." },
  { icon: ShoppingBag, title: "Online Sellers", text: "Facebook pages and e-commerce stores." },
  { icon: Building2, title: "Corporate & Uniform", text: "Office, school and staff footwear." },
  { icon: Users, title: "Distributors", text: "Regular supply for your area." },
];

const STEPS = [
  { title: "Send a Request", text: "Fill in the form with what you need." },
  { title: "We Call You", text: "Our wholesale team contacts you to understand your order." },
  { title: "Get a Quotation", text: "Prices, sizes and delivery time for your order." },
  { title: "Confirm & Receive", text: "Confirm the order and we deliver to your door." },
];

const FAQS = [
  {
    q: "What is the minimum order quantity?",
    a: "It depends on the product and category. Tell us what you need in the form and our team will confirm the minimum quantity for those items.",
  },
  {
    q: "Can I mix different styles and sizes in one order?",
    a: "Yes. You can combine styles, colours and sizes in one wholesale order. Mention your size run in the message.",
  },
  {
    q: "How do I get the wholesale list?",
    a: "Send the request form. We share a quotation based on the categories and quantity you are interested in.",
  },
  {
    q: "Do you deliver outside Dhaka?",
    a: "Yes, we deliver across Bangladesh. Delivery time and charge depend on your location and order size.",
  },
  {
    q: "How do I pay for a wholesale order?",
    a: "Payment terms are confirmed with the quotation. Our team will explain the options when they call you.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  highlight,
  text,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  text?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-black leading-tight md:text-4xl ${dark ? "text-white" : "text-foreground"}`}
      >
        {title} <span className="text-brand-red">{highlight}</span>
      </h2>
      {text && (
        <p className={`mt-4 ${dark ? "text-neutral-400" : "text-muted-foreground"}`}>{text}</p>
      )}
    </div>
  );
}

export default function WholesaleLanding({ phone }: { phone: string | null }) {
  const { data } = useQuery({
    queryKey: ["categories", "home-top-level"],
    queryFn: () => getAllCategories({ limit: "200" }),
    staleTime: 10 * 60 * 1000,
  });
  const categories: { name: string; image?: string | null }[] = (data?.data || [])
    .filter((c: any) => c.isActive !== false && !c.parentId)
    .map((c: any) => ({ name: c.name, image: c.image }));
  // The form's quantity, held here so other sections can pre-fill it
  const [quantity, setQuantity] = useState("");

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-[#d7141f]/25 blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7141f]/40 bg-[#d7141f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff4d57]">
              <span className="size-1.5 rounded-full bg-[#ff4d57]" />
              Wholesale · Bulk Orders
            </span>
            <h1 className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
              Wholesale Shoes for <span className="text-[#ff4d57]">Your Business</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-neutral-300 sm:text-lg">
              Buying for a shop, an online store or a company? Get Shoe Mart
              footwear in bulk at wholesale, with delivery across
              Bangladesh.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={scrollToForm}
                className="h-12 gap-2 rounded-full bg-[#d7141f] px-6 font-bold text-white hover:bg-[#b5121c]"
              >
                Request Wholesale <ArrowRight className="size-4" />
              </Button>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 font-bold transition-colors hover:bg-white hover:text-black"
                >
                  <Phone className="size-4" /> {phone}
                </a>
              )}
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-300">
              {["Bulk pricing", "All sizes", "Nationwide delivery"].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#ff4d57]" /> {point}
                </li>
              ))}
            </ul>
          </div>

          <WholesaleHeroImage fallback={categories.find((c) => c.image)?.image} />
        </div>

        {categories.length > 0 && (
          <div className="relative border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              {categories.map(({ name }) => (
                <span key={name} className="flex items-center gap-2">
                  <PackageCheck className="size-4 text-[#ff4d57]" /> {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Why Shoe Mart */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Why Shoe Mart"
          title="Why buy wholesale"
          highlight="from us?"
          text="Everything a reseller needs: the right price, the right sizes and on-time delivery."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-xl"
            >
              <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-brand-red group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who we work with */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Who We Serve"
            title="Whatever your business,"
            highlight="we've got you."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BUYERS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <SectionHeading eyebrow="Process" title="How it" highlight="works" dark />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-7 hidden h-px w-full bg-gradient-to-r from-[#d7141f] to-white/10 lg:block"
                  />
                )}
                <span className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-full border-2 border-[#d7141f] bg-[#0a0a0a] text-xl font-black">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                <p className="mx-auto max-w-[16rem] text-sm text-neutral-400">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="h-12 gap-2 rounded-full bg-[#d7141f] px-6 font-bold text-white hover:bg-[#b5121c]"
            >
              Start Your Wholesale Order <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ + form */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              Questions & Answers
            </p>
            <h2 className="mb-6 text-3xl font-black md:text-4xl">Common questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  value={`faq-${i}`}
                  className="rounded-xl border bg-card px-4 last:border-b"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-6 text-sm text-muted-foreground">
              Looking for a single pair?{" "}
              <Link href="/products" className="font-semibold text-brand-red hover:underline">
                Shop retail
              </Link>
            </p>
          </div>

          <div id={WHOLESALE_FORM_ID} className="scroll-mt-32 lg:col-span-3 lg:scroll-mt-36">
            <div className="rounded-3xl border bg-card p-6 shadow-xl md:p-8">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-red">
                <Send className="size-3.5" /> Wholesale Request
              </p>
              <h2 className="text-2xl font-black md:text-3xl">Get your wholesale quotation</h2>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                Fill in a few details and our wholesale team will call you.
              </p>
              <WholesaleForm
                categories={categories.map((c) => c.name)}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
