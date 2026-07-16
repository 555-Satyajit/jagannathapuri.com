"use client";

import { useState } from "react";
import { submitContactMessage } from "@/actions/contact";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await submitContactMessage(formData);

    if (result.success) {
      setSuccessMessage(result.message);
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMessage(result.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-zinc-700">Full Name *</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            placeholder="Jagannathapuri"
            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-zinc-50 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-zinc-700">Email Address *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="info@jagannathapuri.com"
            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-zinc-50 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-bold text-zinc-700">Your Message *</label>
        <textarea 
          id="message" 
          name="message" 
          required 
          rows={5}
          placeholder="How can we help you?"
          className="w-full p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-zinc-50 focus:bg-white outline-none transition-all resize-y min-h-[120px]"
        />
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="h-12 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors flex items-center justify-center disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
