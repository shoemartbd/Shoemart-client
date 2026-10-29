import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

export default function Newsletter() {
  return (
    <section className="py-10">
      <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-16 lg:p-20 relative overflow-hidden flex flex-col items-center text-center">
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-8">
          <SectionHeading
            eyebrow="Never Miss A Deal"
            title="Subscribe to our Newsletter"
            subtitle="Get the latest updates on new products, exclusive deals, and seasonal sales directly in your inbox."
          />

          <form className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto pt-4">
            <div className="relative flex-1">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <Button className="h-16 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Join Now <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
