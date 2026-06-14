import { Suspense } from "react"
import { PopupContent } from "@/components/popup-content"
import Loading from "./loading"

export default function PopupsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Popups</h1>
          <p className="text-muted-foreground">Configure promotional popups and schedules.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <PopupContent />
      </Suspense>
    </div>
  )
}
