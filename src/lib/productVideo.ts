// Product video links (YouTube / Facebook) entered on the product form

const SUPPORTED_HOST = /(^|\.)(youtube\.com|youtu\.be|facebook\.com|fb\.watch)$/i;

export const isSupportedVideoUrl = (url: string) => {
  try {
    return SUPPORTED_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

// Turns a watch / share link into an embeddable iframe src; "" when unsupported
export const getProductVideoEmbedUrl = (url?: string | null) => {
  if (!url) return "";
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return "";
  }
  const host = parsed.hostname.replace(/^(www|m)\./i, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }
  if (host.endsWith("youtube.com")) {
    const id =
      parsed.searchParams.get("v") ||
      parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }
  if (host.endsWith("facebook.com") || host === "fb.watch") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(parsed.toString())}&show_text=false`;
  }
  return "";
};
