import { Suspense } from "react"
import { FestivalsContent } from "@/components/festivals-content"
import Loading from "./loading"

export default function FestivalsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Festivals</h1>
          <p className="text-muted-foreground">Manage and schedule temple festivals.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <FestivalsContent />
      </Suspense>
    </div>
  )
}
