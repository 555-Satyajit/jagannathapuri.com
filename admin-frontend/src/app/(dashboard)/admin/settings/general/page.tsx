import { SettingsContent } from "@/components/settings-content"

export default function GeneralSettingsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground">Configure global store settings, SEO, and navigation.</p>
        </div>
      </div>
      <SettingsContent />
    </div>
  )
}
