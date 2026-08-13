import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
  /** Show the wordmark next to the mark (hidden on small/collapsed layouts). */
  showWordmark?: boolean;
  /** Use a compact variant (smaller mark) for dense headers. */
  compact?: boolean;
  /** Use light text for dark backgrounds (e.g. the footer). */
  light?: boolean;
}

/**
 * Single source of truth for the Learnova brand. Used across the public
 * header, auth screens, footer and every dashboard so the logo never changes
 * between contexts.
 */
const Logo = ({
  href = "/",
  className,
  showWordmark = true,
  compact = false,
  light = false,
}: LogoProps) => {
  const mark = (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary-pale font-black text-white shadow-sm",
        compact ? "size-7 text-sm" : "size-9 text-base",
      )}
      aria-hidden
    >
      L
    </span>
  );

  const wordmark = (
    <span
      className={cn(
        "font-heading font-extrabold tracking-tight",
        compact ? "text-lg" : "text-xl",
        light ? "text-white" : "text-ink",
      )}
    >
      Learnova
    </span>
  );

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 outline-none",
        className,
      )}
      aria-label="Learnova home"
    >
      {mark}
      {showWordmark && wordmark}
    </Link>
  );
};

export default Logo;
