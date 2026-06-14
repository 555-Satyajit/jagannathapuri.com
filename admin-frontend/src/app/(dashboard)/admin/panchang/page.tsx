import { Suspense } from "react"
import { PanchangContent } from "@/components/panchang-content"
import Loading from "./loading"

export default function PanchangPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panchang</h1>
          <p className="text-muted-foreground">Manage astrological timings and calendar sections.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <PanchangContent />
      </Suspense>
    </div>
  )
}
