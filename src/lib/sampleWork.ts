// Cloudinary URL helpers for sample-work PDFs, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v123/shoemart/sample-works/file.pdf

// "Shoe Mart Profile 2026" -> "shoe-mart-profile-2026.pdf"
const pdfFileName = (title: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "document"
  }.pdf`;

// View (opens in the browser's PDF viewer) / Download (saves the file).
// Served from our own domain by app/sample-works/[id]/[file]/route.ts, so
// visitors never see the Cloudinary link, keys or signatures.
type PdfRef = { id: string; title: string };
export const sampleWorkViewUrl = ({ id, title }: PdfRef) =>
  `/sample-works/${id}/${pdfFileName(title)}`;
export const sampleWorkDownloadUrl = (item: PdfRef) => `${sampleWorkViewUrl(item)}?download=1`;

// First page rendered as an image, for the card cover
export const pdfCoverUrl = (url: string, width = 600) =>
  url.includes("/upload/") && /\.pdf$/i.test(url)
    ? url.replace("/upload/", `/upload/pg_1,w_${width},c_limit,q_auto/`).replace(/\.pdf$/i, ".jpg")
    : null;

export const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface UploadSignature {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
}

// Uploads from the browser straight to Cloudinary (the API host has a small
// request size limit), reporting progress 0-100
export const uploadToCloudinary = (
  file: File,
  sig: UploadSignature,
  onProgress?: (percent: number) => void,
) =>
  new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.error?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(form);
  });
