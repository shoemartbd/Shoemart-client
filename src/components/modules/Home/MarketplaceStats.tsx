import { Users, Truck, Package, Star } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const stats = [
  {
    label: "Happy Customers",
    value: "50k+",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
  },
  {
    label: "Orders Delivered",
    value: "80k+",
    icon: Truck,
    color: "from-emerald-500 to-teal-600",
  },
  {
    label: "Quality Products",
    value: "10k+",
    icon: Package,
    color: "from-orange-500 to-rose-600",
  },
  {
    label: "Average Rating",
    value: "4.9/5",
    icon: Star,
    color: "from-purple-500 to-pink-600",
  },
];

export default function MarketplaceStats() {
  return (
    <section className="py-12 relative overflow-hidden rounded-[2.5rem] bg-slate-900">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 container mx-auto px-6">
        <SectionHeading
          light
          eyebrow="Trusted Store"
          title="Shoe Mart in Numbers"
          subtitle="Trusted by thousands of shoppers across the country"
          className="mb-16"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
