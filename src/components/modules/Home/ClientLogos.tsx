"use client";

import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/shared/SectionHeading";
import { getClientLogos } from "@/services/clientLogo.services";

const tileClass =
  "flex aspect-square w-20 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-primary/40 md:w-28";

// Companies we work for, managed from Dashboard → Pages → Home. Same endless
// logo strip as BrandMarquee, with a heading so it reads as "clients", not
// "brands we sell". Sits right before the testimonials.
export default function ClientLogos() {
  const { data: clients = [] } = useQuery({
    queryKey: ["client-logos", "public"],
    queryFn: () => getClientLogos(),
    staleTime: 10 * 60 * 1000,
  });

  if (clients.length === 0) return null;

  // Repeat short lists so one copy is wider than the screen
  const minItems = 10;
  const repeats = Math.max(1, Math.ceil(minItems / clients.length));
  const oneCopy = Array.from({ length: repeats }, () => clients).flat();
  // Speed stays even: roughly 3s per logo
  const duration = `${oneCopy.length * 3}s`;

  return (
    <section aria-label="Our clients" className="space-y-6">
      <SectionHeading eyebrow="Our Clients" title="Trusted by Leading Brands" />

      <div className="group relative overflow-hidden rounded-2xl border bg-card py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="flex w-max animate-[brand-marquee_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: duration }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 items-center gap-4 pr-4 md:gap-6 md:pr-6"
              aria-hidden={copy === 1}
            >
              {oneCopy.map((client, i) => {
                const logo = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.logo}
                    alt={client.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="h-auto w-auto max-h-full max-w-full object-contain"
                  />
                );
                return (
                  <li key={`${copy}-${client.id}-${i}`}>
                    {client.website ? (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={copy === 1 ? -1 : undefined}
                        title={client.name}
                        className={tileClass}
                      >
                        {logo}
                      </a>
                    ) : (
                      <div title={client.name} className={tileClass}>
                        {logo}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
