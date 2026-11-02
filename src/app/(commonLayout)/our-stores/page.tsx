import type { Metadata } from "next";
import { getStores } from "@/services/store.services";
import { getSiteSettings } from "@/services/siteSetting.services";
import { IStore } from "@/types/store.types";
import StoreList from "./_components/StoreList";

export const metadata: Metadata = {
  title: "Our Stores | Shoe Mart",
  description: "Find a Shoe Mart store near you: addresses, opening hours and directions.",
};

export default async function OurStoresPage() {
  const [storesRes, siteSettingsRes] = await Promise.all([
    getStores().catch(() => null),
    getSiteSettings().catch(() => null),
  ]);
  const stores: IStore[] = storesRes ?? [];
  const phone = siteSettingsRes?.data?.phone ?? null;

  return (
    <div className="bg-muted/30">
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-10 text-center md:px-8 md:py-14">
          <h1 className="text-3xl font-bold uppercase tracking-wide md:text-4xl">
            Our Stores
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Visit us in person: find the nearest outlet, its opening hours and
            directions.
          </p>
        </div>
      </section>

      <StoreList stores={stores} phone={phone} />
    </div>
  );
}
