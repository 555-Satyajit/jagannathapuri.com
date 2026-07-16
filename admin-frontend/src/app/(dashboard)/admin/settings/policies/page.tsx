import { PoliciesContent } from "@/components/policies-content"

export const metadata = {
  title: "Policies | Jagannathapuri Admin",
  description: "Manage store policies",
}

export default async function PoliciesPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <PoliciesContent />
}
