"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  Rocket,
} from "lucide-react";
import {
  getMyLandingPages,
  deleteLandingPage,
} from "@/services/landingPage.services";
import { ILandingPage } from "@/types/landingPage.types";
import { confirmAction } from "@/lib/confirmAction";

export default function LandingPagesPage() {
  const [landingPages, setLandingPages] = useState<ILandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "",
  );

  const fetchLandingPages = async () => {
    setIsLoading(true);
    try {
      const res = await getMyLandingPages();
      setLandingPages(res.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load landing pages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirmAction({
      title: "Delete this landing page?",
      text: "This cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteLandingPage(id);
      toast.success("Landing page deleted");
      fetchLandingPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete landing page");
    }
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${origin}/lp/${slug}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Landing Pages</h3>
          <p className="text-muted-foreground">
            Create focused, ad-ready campaign pages for your products with a
            built-in guest checkout.
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-lg">
          <Link href="/admin/dashboard/landing-pages/add">
            <Plus className="mr-2 h-4 w-4" /> Create Landing Page
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : landingPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 h-64 border border-dashed rounded-xl text-center px-4">
          <Rocket className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No landing pages yet. Create one to start driving focused campaign
            traffic.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {landingPages.map((lp) => (
            <div
              key={lp.id}
              className="rounded-xl border shadow-sm overflow-hidden bg-card flex flex-col"
            >
              <div className="relative h-36 w-full bg-muted">
                {lp.bannerImage ? (
                  <Image
                    src={lp.bannerImage}
                    alt={lp.campaignTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Rocket className="h-8 w-8 opacity-40" />
                  </div>
                )}
                <Badge
                  className={`absolute top-2 right-2 ${
                    lp.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {lp.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div>
                  <h4 className="font-bold line-clamp-1">{lp.campaignTitle}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {lp.product?.name}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {lp.views} views
                </div>

                <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2 overflow-hidden">
                  <span className="truncate flex-1 text-muted-foreground">
                    /lp/{lp.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(lp.slug)}
                    className="shrink-0 hover:text-primary transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                    <Link href={`/lp/${lp.slug}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                    <Link href={`/admin/dashboard/landing-pages/${lp.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(lp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
