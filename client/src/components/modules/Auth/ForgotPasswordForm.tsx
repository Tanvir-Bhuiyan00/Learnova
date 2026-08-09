"use client";

import { forgotPasswordAction } from "@/app/(commonLayout)/(authRouteGroup)/forgot-password/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IForgotPasswordPayload,
  forgotPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: IForgotPasswordPayload) =>
      forgotPasswordAction(payload),
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const result = await mutateAsync(value);

        if (!result.success) {
          setServerError(result.message || "Failed to send reset email");
          return;
        }

        setEmailSent(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to send reset email";
        setServerError(message);
      }
    },
  });

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="pt-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-positive" />
          <CardTitle className="font-heading text-2xl font-extrabold text-ink">Check Your Email</CardTitle>
          <CardDescription>
            If an account with that email exists, we&apos;ve sent password reset
            instructions.
          </CardDescription>
          <Link
            href="/login"
            className="mt-4 block text-sm font-semibold text-ink-deep transition-colors hover:text-ink hover:underline underline-offset-4"
          >
            Back to Login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-3xl font-black tracking-tight">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          method="POST"
          action="#"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
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
          </form.Field>

          {serverError && (
            <Alert variant={"destructive"}>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                isPending={isSubmitting || isPending}
                pendingLabel="Sending..."
                disabled={!canSubmit}
              >
                Send Reset Instructions
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-ink-deep transition-colors hover:text-ink hover:underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
