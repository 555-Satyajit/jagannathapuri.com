import { ContactContent } from "@/components/contact-content"

export default function ContactPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Contact & FAQs</h1>
          <p className="text-muted-foreground">Configure your store's contact information and frequently asked questions.</p>
        </div>
      </div>
      <ContactContent />
    </div>
  )
}
