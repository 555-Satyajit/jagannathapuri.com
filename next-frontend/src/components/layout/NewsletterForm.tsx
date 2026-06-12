"use client";
import { useActionState } from "react";
import { Mail } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

export default function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null);

  return (
    <div className="w-full">
      {state?.success && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium">
          {state.message}
        </div>
      )}
      {!state?.success && state?.message && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
          {state.message}
        </div>
      )}
      <form action={formAction} className="relative flex items-center group">
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors">
          <Mail className="w-5 h-5" />
        </div>
        <input 
          type="email" 
          name="email"
          placeholder="Enter your email address" 
          required
          className="w-full bg-white border border-orange-200/60 text-zinc-900 pl-12 pr-[140px] py-4 rounded-full outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all placeholder:text-zinc-400"
        />
        <button 
          type="submit" 
          disabled={isPending}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isPending ? "Joining..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-zinc-500 mt-3 ml-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
