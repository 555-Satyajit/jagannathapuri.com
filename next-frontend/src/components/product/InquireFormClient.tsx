"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

interface InquireFormClientProps {
  productId: number;
  productName: string;
}

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  message: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export default function InquireFormClient({ productId, productName }: InquireFormClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/auth/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productId })
      });
      const result = await res.json();
      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result.message || "Failed to submit inquiry.");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setErrorMsg("");
      reset();
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6 pt-8 border-t border-zinc-100">
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4">
        <h4 className="font-bold text-orange-900 mb-2">Handmade Patachitra Artwork</h4>
        <p className="text-orange-800 text-sm leading-relaxed">
          This is an exclusive handmade Patachitra artwork. Because each piece is unique and made-to-order, we don't process direct payments online. Please drop an inquiry and our team will get in touch with you to explain the details and guide you through the ordering process.
        </p>
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        className="relative overflow-hidden w-full h-14 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
      >
        <MessageCircle className="w-5 h-5" />
        Inquire Now
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Inquire about {productName}</DialogTitle>
            <DialogDescription>
              Provide your details below and our team will contact you shortly to process your order.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Inquiry Submitted!</h3>
              <p className="text-zinc-500 mb-6">Thank you for your interest. We will get back to you soon.</p>
              <Button onClick={closeDialog} className="w-full h-12 bg-zinc-900 text-white rounded-xl">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </Field>
              <Field>
                <FieldLabel>Phone Number</FieldLabel>
                <Input {...register("phone")} type="tel" placeholder="+91 98765 43210" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </Field>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input {...register("email")} type="email" placeholder="john@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </Field>
              <Field>
                <FieldLabel>Message (Optional)</FieldLabel>
                <textarea 
                  {...register("message")}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any specific questions about the artwork?"
                />
              </Field>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl mt-4">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Inquiry"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
