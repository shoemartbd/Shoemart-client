import { NextRequest } from "next/server";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Serves a sample-work PDF from our own domain, e.g.
//   /sample-works/<id>/shoe-mart-profile.pdf            -> opens in the browser
//   /sample-works/<id>/shoe-mart-profile.pdf?download=1 -> saves the file
// The API hands out a short-lived signed Cloudinary link; we fetch it here
// and stream the file, so visitors never see Cloudinary, keys or signatures.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> },
) {
  const { id, file } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  const download = req.nextUrl.searchParams.get("download") === "1";
  const filename = /^[a-z0-9-]+\.pdf$/i.test(file) ? file : "document.pdf";

  const upstream = await fetch(
    `${BASE_API_URL}/sample-works/${id}/file${download ? "?download=1" : ""}`,
    { cache: "no-store" },
  ).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    return new Response("This file is not available right now.", {
      status: upstream?.status === 404 ? 404 : 502,
    });
  }

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
    // Short browser cache; a replaced PDF shows up within minutes
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers });
}
