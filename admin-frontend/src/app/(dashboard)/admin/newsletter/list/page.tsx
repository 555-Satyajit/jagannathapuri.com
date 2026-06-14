import { Suspense } from "react"
import { NewsletterContent } from "@/components/newsletter-content"
import Loading from "./loading"

export default function NewsletterPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">View and manage email subscriptions.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <NewsletterContent />
      </Suspense>
    </div>
  )
}
