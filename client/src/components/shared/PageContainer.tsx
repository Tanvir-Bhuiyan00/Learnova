import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

/**
 * PageContainer provides consistent layout padding and max-width for page content.
 * Uses responsive padding and centers content with max-width on larger screens.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Content here...</p>
 * </PageContainer>
 * ```
 */
const PageContainer = ({ children, className, spacing = "md" }: PageContainerProps) => {
  const spacingClasses = {
    sm: "py-4",
    md: "py-8",
    lg: "py-12",
  };

  return (
    <div className={cn("container mx-auto px-4", spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

export default PageContainer;
