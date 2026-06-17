"use client";

import { useState } from "react";
import { User, useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AddressManager from "./AddressManager";
import ChangePassword from "./ChangePassword";
import { Loader2, CheckCircle2 } from "lucide-react";

const accountSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountTab({ user }: { user: User }) {
  const { setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      phone: "+91 98765 43210", // mock
      address: "123 Temple Road, Puri, Odisha, 752001", // mock
    }
  });

  const onSubmit = async (data: AccountFormValues) => {
    setIsSaving(true);
    setSuccess(false);
    setError("");
    
    try {
      const res = await fetch("/api/auth/user-update-profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone
        })
      });
      const result = await res.json();
      
      if (result.success) {
        setUser({ ...user, fullName: data.fullName });
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Account Details</h1>
          <p className="text-zinc-500 mt-1">Manage your personal information and contact details.</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-semibold rounded-xl"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-zinc-700 font-medium">Full Name</Label>
            <Input 
              id="fullName" 
              {...register("fullName")}
              disabled={!isEditing}
              className={`h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 disabled:opacity-100 disabled:bg-zinc-50/50 disabled:text-zinc-600 ${errors.fullName ? 'border-red-500' : ''}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs font-medium">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700 font-medium">Email Address</Label>
            <Input 
              id="email" 
              {...register("email")}
              disabled={!isEditing}
              className={`h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 disabled:opacity-100 disabled:bg-zinc-50/50 disabled:text-zinc-600 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-zinc-700 font-medium">Phone Number</Label>
          <Input 
            id="phone" 
            {...register("phone")}
            disabled={!isEditing}
            className="h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 disabled:opacity-100 disabled:bg-zinc-50/50 disabled:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-zinc-700 font-medium">Default Shipping Address</Label>
          <Input 
            id="address" 
            {...register("address")}
            disabled={true}
            className="h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-orange-500 disabled:opacity-100 disabled:bg-zinc-50/50 disabled:text-zinc-600"
          />
          {!isEditing && <p className="text-xs text-zinc-400 mt-1">Addresses can be managed in the Address Manager below.</p>}
        </div>

        {isEditing && (
          <div className="flex items-center gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-zinc-900 hover:bg-orange-600 text-white rounded-xl font-bold px-8 h-12 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              className="text-zinc-500 hover:text-zinc-900 font-medium rounded-xl h-12 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-8">
        <AddressManager />
      </div>

      <div className="mt-8 border-t border-zinc-200 pt-8">
        <ChangePassword />
      </div>
    </div>
  );
}
