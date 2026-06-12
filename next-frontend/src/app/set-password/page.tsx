"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SetPasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/user-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: "", 
          newPassword: data.password 
        }),
      });

      const result = await response.json();
      if (result.success || response.ok) {
        router.push("/profile");
      } else {
        setError(result.error || "Failed to set password. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-zinc-100">
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
            <ShieldCheck className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 font-serif">
            Secure Your Account
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            Hi {user?.fullName?.split(' ')[0] || "there"}, you signed in using Google. Would you like to set a local password for your account?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter a secure password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 font-bold text-base shadow-md"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Save Password"}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-12 font-medium"
            >
              Skip for now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
