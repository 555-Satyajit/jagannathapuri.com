import { InquiriesContent } from "@/components/inquiries-content"

export const metadata = {
  title: "Inquiries | Jagannathapuri Admin",
  description: "Manage Patachitra inquiries",
}

export default async function InquiriesPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <InquiriesContent />
}
