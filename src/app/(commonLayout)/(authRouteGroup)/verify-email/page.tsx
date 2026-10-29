import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailParams {
  searchParams: Promise<{ email?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailParams) => {
  const params = await searchParams;
  const email = params.email || "";

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <VerifyEmailForm email={email} />
    </div>
  );
};

export default VerifyEmailPage;
