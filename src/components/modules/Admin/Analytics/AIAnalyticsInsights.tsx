"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BrainCircuit,
  Loader2,
  ChevronRight,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { analyzeBusiness } from "@/services/ai.services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AIAnalyticsInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    const res = await analyzeBusiness();
    if (res.success) {
      setInsights(res.data.insights);
      setGeneratedAt(res.data.generatedAt);
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={insights ? undefined : handleAnalyze}
          className="relative overflow-hidden group px-8 py-6 rounded-3xl bg-[#111111] hover:bg-[#000000] text-white shadow-2xl shadow-[#111111]/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#d7141f]/20 via-[#404040]/20 to-[#d7141f]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-[#d7141f] rounded-xl group-hover:rotate-12 transition-transform">
              <BrainCircuit className="size-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                Advanced AI
              </div>
              <div className="text-lg font-black tracking-tight">
                AI Business Insights
              </div>
            </div>
            <ChevronRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 border-none bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7141f]/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#404040]/20 blur-[100px] rounded-full -ml-32 -mb-32" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#d7141f] text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Gemini Flash 1.5
                </Badge>
                {generatedAt && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Generated {new Date(generatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Sparkles className="size-8 text-[#ef3340] fill-[#ef3340]/20" />
                  Marketplace Intelligence
                </DialogTitle>
                <DialogDescription className="sr-only">
                  AI Business Analytics and Marketplace Intelligence
                </DialogDescription>
              </DialogHeader>
            </div>

            {!loading && insights && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
              >
                <RefreshCw className="size-4 mr-2" /> Regenerate
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-[#d7141f]/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="size-16 text-[#d7141f] animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Analyzing Data...
                </h4>
                <p className="text-slate-500 font-medium">
                  Gemini is crunching your business metrics to find hidden
                  opportunities.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-8 pb-10">
              {/* Custom Styled HTML Content */}
              <div
                className="prose prose-slate dark:prose-invert max-w-none 
                prose-h3:text-2xl prose-h3:font-black prose-h3:text-slate-900 prose-h3:dark:text-white prose-h3:mt-8 prose-h3:mb-4 prose-h3:flex prose-h3:items-center prose-h3:gap-3
                prose-p:text-slate-600 prose-p:dark:text-slate-400 prose-p:leading-relaxed prose-p:text-lg
                prose-ul:space-y-3 prose-li:text-slate-600 prose-li:dark:text-slate-400 prose-li:text-lg
                prose-strong:text-slate-900 prose-strong:dark:text-white prose-strong:font-black"
                dangerouslySetInnerHTML={{ __html: insights }}
              />

              <div className="p-8 rounded-[2rem] bg-[#111111] text-white shadow-2xl shadow-[#111111]/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rotate-45 translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black mb-2 flex items-center gap-2">
                  <Lightbulb className="size-6 text-orange-300" />
                  Ready to Grow?
                </h4>
                <p className="text-blue-50 font-medium text-lg leading-relaxed">
                  These insights are based on real-time data from your
                  marketplace.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p>Something went wrong. Please try again.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
