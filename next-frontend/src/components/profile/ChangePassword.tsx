"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, Key } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePassword() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSaving(true);
    setSuccess(false);
    setError("");
    
    try {
      const res = await fetch("/api/auth/user-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      const result = await res.json();
      
      if (result.success) {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Key className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Change Password</h2>
          <p className="text-sm text-zinc-500">Update your password to keep your account secure.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Password successfully changed!
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password"
            {...register("currentPassword")}
            className={`h-11 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 ${errors.currentPassword ? 'border-red-500' : ''}`}
          />
          {errors.currentPassword && <p className="text-red-500 text-xs font-medium">{errors.currentPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password"
            {...register("newPassword")}
            className={`h-11 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 ${errors.newPassword ? 'border-red-500' : ''}`}
          />
          {errors.newPassword && <p className="text-red-500 text-xs font-medium">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password"
            {...register("confirmPassword")}
            className={`h-11 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-zinc-900 hover:bg-orange-600 text-white rounded-xl font-bold px-8 h-11 transition-colors"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isSaving ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
