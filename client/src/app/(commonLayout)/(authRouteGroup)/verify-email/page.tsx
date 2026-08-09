import AuthLayout from "@/components/modules/Auth/AuthLayout";
import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailParams {
  searchParams: Promise<{ email?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailParams) => {
  const params = await searchParams;
  const email = params.email || "";
  return (
    <AuthLayout>
      <VerifyEmailForm email={email} />
    </AuthLayout>
  );
};

export default VerifyEmailPage;
