/* eslint-disable react-hooks/purity */
"use client";

import {
  MessageSquare,
  X,
  Send,
  RefreshCw,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getUserRoleAction,
  ingestRagAction,
  queryRagAction,
} from "@/app/_actions/rag.actions";
import { IRagSource } from "@/types/rag.types";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: IRagSource[];
  isError?: boolean;
  queryToRetry?: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "bot",
    content:
      "Hi! I'm the Learnova course assistant. Ask me about our courses, instructors, pricing, lessons, or what students say about them.",
  },
];

const SUGGESTED_QUERIES = [
  "Best courses for beginners?",
  "Which instructor teaches Python?",
  "What is the cheapest course?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-md">
        <Bot className="size-4 text-primary-foreground" />
      </div>
      <div className="rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 animate-bounce rounded-full bg-mute-text" />
          <span
            className="inline-block size-2 animate-bounce rounded-full bg-mute-text"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="inline-block size-2 animate-bounce rounded-full bg-mute-text"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onRetry,
}: {
  message: Message;
  onRetry?: (query: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-md ${
          isUser
            ? "bg-ink text-background"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={`flex max-w-[78%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-3xl rounded-br-md bg-primary text-primary-foreground shadow-md"
              : "rounded-3xl rounded-bl-md border border-border bg-card text-ink shadow-sm"
          }`}
        >
          {message.content
            .split(/(\*\*.*?\*\*)/g)
            .map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i}>{part.slice(2, -2)}</strong>
              ) : (
                part
              ),
            )}
        </div>

        {message.isError && onRetry && message.queryToRetry && (
          <button
            onClick={() => onRetry(message.queryToRetry!)}
            className="mt-1 flex cursor-pointer items-center gap-1 rounded-md border border-primary/40 bg-primary-pale px-2 py-1 text-[10px] font-medium text-ink-deep transition-colors hover:bg-primary-neutral"
          >
            <RefreshCw className="size-2.5" />
            Retry
          </button>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            <span className="mb-0.5 w-full text-[10px] text-mute-text">
              Sources:
            </span>
            {message.sources.map((source, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-pale px-2 py-0.5 text-[10px] font-medium text-ink-deep"
              >
                <Sparkles className="size-2.5" />
                {source.sourceLabel ?? `Source ${i + 1}`}
                {typeof source.similarity === "number" && (
                  <span className="text-mute-text">
                    {(source.similarity * 100).toFixed(0)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isQuerying, startQueryTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [userRole, setUserRole] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRole = async () => {
    const role = await getUserRoleAction();
    setUserRole(role);
  };

  const handleSync = () => {
    startSyncTransition(async () => {
      const result = await ingestRagAction();
      if (result.success) {
        toast.success("Course data synced!", {
          description:
            result.message ?? `${result.indexedCount ?? 0} documents indexed.`,
        });
      } else {
        toast.error("Sync failed", { description: result.error });
      }
    });
  };

  const handleSend = (query?: string) => {
    const text = (query ?? inputValue).trim();
    if (!text || isQuerying) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    startQueryTransition(async () => {
      const result = await queryRagAction(text);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: result.success
          ? result.answer!
          : (result.error ?? "Something went wrong. Please try again."),
        sources: result.success ? result.sources : undefined,
        isError: !result.success,
        queryToRetry: !result.success ? text : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    });
  };

  return (
    <>
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
        style={{ maxHeight: "78vh" }}
        aria-hidden={!isOpen}
      >
        <div className="flex shrink-0 items-center justify-between bg-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm">
              <Bot className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm leading-none font-bold text-primary-foreground">
                AI Course Assistant
              </p>
              <p className="mt-1 text-[10px] text-primary-foreground/80">
                Powered by Learnova RAG
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Re-index course data"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-primary-foreground transition-colors hover:bg-primary-foreground/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-4 ${isSyncing && "animate-spin"}`}
                />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-canvas-soft/40 p-4"
          style={{ minHeight: "200px", maxHeight: "55vh" }}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={handleSend}
            />
          ))}

          {isQuerying && <TypingIndicator />}

          {messages.length === 1 && !isQuerying && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="px-1 text-[11px] font-medium text-mute-text">
                Try asking:
              </p>
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSend(query)}
                  className="cursor-pointer rounded-2xl border border-border bg-card px-4 py-2.5 text-left text-xs text-body-text shadow-sm transition-all hover:border-primary hover:bg-primary-pale hover:text-ink-deep"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about courses, instructors..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isQuerying}
              className="flex-1 rounded-2xl border border-transparent bg-canvas-soft px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-mute-text focus:border-primary focus:bg-card disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isQuerying || !inputValue.trim()}
              aria-label="Send message"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary-neutral active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>

      <button
        onClick={() => {
          fetchRole();
          setIsOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 300);
        }}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className={`fixed right-6 bottom-6 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
          isOpen ? "rotate-90" : "rotate-0"
        }`}
      >
        {isOpen ? <X className="size-6" /> : <MessageSquare className="size-6" />}
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-30" />
        )}
      </button>
    </>
  );
}