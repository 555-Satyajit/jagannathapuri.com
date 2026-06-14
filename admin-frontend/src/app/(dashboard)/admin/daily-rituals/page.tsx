import { Suspense } from "react"
import { DailyRitualsContent } from "@/components/daily-rituals-content"
import Loading from "./loading"

export default function DailyRitualsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Rituals</h1>
          <p className="text-muted-foreground">Manage temple rituals, darshan timings, and temple facts.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <DailyRitualsContent />
      </Suspense>
    </div>
  )
}
