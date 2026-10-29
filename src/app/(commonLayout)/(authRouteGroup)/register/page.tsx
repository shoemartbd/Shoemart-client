import RegisterForm from "@/components/modules/Auth/RegisterForm";

interface RegisterParams {
  searchParams: Promise<{ redirect?: string }>;
}

const RegisterPage = async ({ searchParams }: RegisterParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  return <RegisterForm redirectPath={redirectPath} />;
};

export default RegisterPage;
