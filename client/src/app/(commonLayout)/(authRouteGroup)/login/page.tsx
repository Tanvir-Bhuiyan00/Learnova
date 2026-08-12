import AuthLayout from "@/components/modules/Auth/AuthLayout";
import LoginForm from "@/components/modules/Auth/LoginForm";

interface LoginParams {
  searchParams: Promise<{ redirect?: string; registered?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  const registered = params.registered === "true";
  return (
    <AuthLayout>
      <LoginForm redirectPath={redirectPath} registered={registered} />
    </AuthLayout>
  );
};

export default LoginPage;
