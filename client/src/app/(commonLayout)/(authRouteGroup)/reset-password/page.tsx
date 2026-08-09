import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

interface ResetPasswordParams {
  searchParams: Promise<{ email?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordParams) => {
  const params = await searchParams;
  const email = params.email || "";
  return <ResetPasswordForm email={email} />;
};

export default ResetPasswordPage;
