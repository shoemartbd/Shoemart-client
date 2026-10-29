"use client";

import {
  forgotPasswordAction,
  resetPasswordAction,
} from "@/app/(commonLayout)/(authRouteGroup)/forgot-password/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Step 1: email → a 6-digit code is emailed.
// Step 2: code + new password → back to login.
const ForgotPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);

  const emailForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await forgotPasswordAction(value);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      toast.success("We've sent a 6-digit code to your email");
      setEmail(value.email);
    },
  });

  const resetForm = useForm({
    defaultValues: { otp: "", newPassword: "" },
    onSubmit: async ({ value }) => {
      if (!email) return;
      setServerError(null);
      const result = await resetPasswordAction({ email, ...value });
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      toast.success("Password changed. Please log in with your new password.");
      router.push("/login");
    },
  });

  const resendCode = async () => {
    if (!email) return;
    setServerError(null);
    setResending(true);
    try {
      const result = await forgotPasswordAction({ email });
      if (result.success) toast.success("A new code is on its way");
      else setServerError(result.message);
    } finally {
      setResending(false);
    }
  };

  const startOver = () => {
    setEmail(null);
    setServerError(null);
    resetForm.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md mt-10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {email ? "Set a New Password" : "Forgot Password?"}
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-foreground">{email}</span> and
              choose a new password. The code is valid for 10 minutes.
            </>
          ) : (
            "Enter your account email and we'll send you a code to reset your password."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!email ? (
          <form
            method="POST"
            action="#"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              emailForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <emailForm.Field
              name="email"
              validators={{ onChange: forgotPasswordZodSchema.shape.email }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />
              )}
            </emailForm.Field>

            {serverError && (
              <Alert variant={"destructive"}>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <emailForm.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton
                  isPending={isSubmitting}
                  pendingLabel="Sending code...."
                  disabled={!canSubmit}
                >
                  Send Reset Code
                </AppSubmitButton>
              )}
            </emailForm.Subscribe>
          </form>
        ) : (
          <form
            method="POST"
            action="#"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <resetForm.Field
              name="otp"
              validators={{ onChange: resetPasswordZodSchema.shape.otp }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Reset Code"
                  type="text"
                  placeholder="Enter the 6-digit code"
                />
              )}
            </resetForm.Field>

            <resetForm.Field
              name="newPassword"
              validators={{ onChange: resetPasswordZodSchema.shape.newPassword }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  append={
                    <Button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      variant="ghost"
                      size="icon"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                  }
                />
              )}
            </resetForm.Field>

            {serverError && (
              <Alert variant={"destructive"}>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <resetForm.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <AppSubmitButton
                  isPending={isSubmitting}
                  pendingLabel="Saving...."
                  disabled={!canSubmit}
                >
                  Reset Password
                </AppSubmitButton>
              )}
            </resetForm.Subscribe>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={startOver}
                className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resending}
                className="font-medium text-primary hover:underline underline-offset-4 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
