import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import PageContainer from "@/components/shared/PageContainer";
import { FileQuestion, Home, BookOpen, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <EmptyState
          icon={FileQuestion}
          title="Page Not Found"
          description="The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to safety."
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                <FolderOpen className="mr-2 h-4 w-4" />
                View Categories
              </Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    </PageContainer>
  );
}
