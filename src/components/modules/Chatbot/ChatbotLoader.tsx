"use client";

import dynamic from "next/dynamic";

// The chat widget isn't needed to show the page: load its code after the page
// is up, so it doesn't slow down the first paint on every page
const FloatingChatbot = dynamic(() => import("./FloatingChatbot"), { ssr: false });

export default function ChatbotLoader() {
  return <FloatingChatbot />;
}
