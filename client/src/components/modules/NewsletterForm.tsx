"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
        <CheckCircle2 className="size-4" />
        You&apos;re subscribed! Watch your inbox for course updates.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-sm">
      <div className="flex items-center gap-2">
        <Input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          className="rounded-full border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:bg-white/10"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 rounded-full"
          aria-label="Subscribe to newsletter"
        >
          <Send className="size-4" />
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs font-medium text-rose-400">
          Please enter a valid email address.
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
