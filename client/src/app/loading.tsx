import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

export default function GlobalLoading() {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingState.Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </PageContainer>
  );
}
