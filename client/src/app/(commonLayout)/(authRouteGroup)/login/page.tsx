import AuthLayout from "@/components/modules/Auth/AuthLayout";
import LoginForm from "@/components/modules/Auth/LoginForm";

interface LoginParams {
  searchParams: Promise<{ redirect?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  return (
    <AuthLayout>
      <LoginForm redirectPath={redirectPath} />
    </AuthLayout>
  );
};

export default LoginPage;
