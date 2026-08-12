"use client";

import dynamic from "next/dynamic";

const FloatingChatbot = dynamic(
  () =>
    import("@/components/modules/Chatbot/FloatingChatbot").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

export default function ChatbotMount() {
  return <FloatingChatbot />;
}