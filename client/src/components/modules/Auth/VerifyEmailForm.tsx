"use client";

import { verifyEmailAction } from "@/app/(commonLayout)/(authRouteGroup)/verify-email/_action";
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
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

interface VerifyEmailFormProps {
  email: string;
}

const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: IVerifyEmailPayload) => verifyEmailAction(payload),
  });

  const form = useForm({
    defaultValues: {
      email: email || "",
      otp: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const result = await mutateAsync(value);

        if (!result.success) {
          setServerError(result.message || "Verification failed");
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Verification failed";
        setServerError(message);
      }
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
        <CardDescription>
          Enter the OTP sent to your email to verify your account.
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
            validators={{ onChange: verifyEmailZodSchema.shape.email }}
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

          <form.Field
            name="otp"
            validators={{ onChange: verifyEmailZodSchema.shape.otp }}
          >
            {(field) => (
              <AppField
                field={field}
                label="OTP"
                type="text"
                placeholder="Enter the OTP from your email"
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
                pendingLabel="Verifying..."
                disabled={!canSubmit}
              >
                Verify Email
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
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

export default VerifyEmailForm;
