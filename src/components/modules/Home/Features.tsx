import { ShieldCheck, Zap, CreditCard, Headphones } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const features = [
  {
    title: "Fast Delivery",
    description:
      "Get your products delivered to your doorstep within 24-48 hours.",
    icon: Zap,
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
  {
    title: "Secure Payment",
    description:
      "100% secure payment processing with industry-leading encryption.",
    icon: ShieldCheck,
    color: "text-brand-black",
    bg: "bg-brand-black/10",
  },
  {
    title: "Buyer Protection",
    description: "Money-back guarantee if the product is not as described.",
    icon: CreditCard,
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
  {
    title: "24/7 Support",
    description: "Our dedicated support team is always here to help you out.",
    icon: Headphones,
    color: "text-brand-black",
    bg: "bg-brand-black/10",
  },
];

export default function Features() {
  return (
    <section className="py-10">
      <SectionHeading
        eyebrow="Why Shoe Mart"
        title="Built For A Better Shopping Experience"
        className="mb-10"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div
            key={i}
            className="group p-8 rounded-2xl bg-card border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
          >
            <div
              className={`${feature.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
            >
              <feature.icon className={`h-7 w-7 ${feature.color}`} />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3">
              {feature.title}
            </h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
