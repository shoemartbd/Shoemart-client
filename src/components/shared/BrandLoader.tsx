// Full-screen brand loader used by the route loading screen and the first-load
// preloader. Plain <img> + CSS so it shows instantly, before any JS runs.
export default function BrandLoader() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* soft glow */}
        <div className="absolute -inset-3 animate-pulse rounded-[2rem] bg-primary/15 blur-xl [animation-duration:1.8s]" />
        {/* logo on white, since the JPEG has a white background (also in dark mode) */}
        <div className="relative rounded-3xl bg-white p-4 shadow-xl shadow-primary/20 ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mainlogo.jpeg"
            alt="Shoe Mart"
            width={1293}
            height={854}
            fetchPriority="high"
            decoding="async"
            className="h-auto w-40 sm:w-48"
          />
        </div>
      </div>

      {/* sweeping progress line */}
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[brand-loader_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#111111] to-[#d7141f]" />
      </div>
    </div>
  );
}
