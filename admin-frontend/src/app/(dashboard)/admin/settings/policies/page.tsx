import { PoliciesContent } from "@/components/policies-content"

export const metadata = {
  title: "Policies | Jay Subhdra Admin",
  description: "Manage store policies",
}

export default async function PoliciesPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <PoliciesContent />
}
