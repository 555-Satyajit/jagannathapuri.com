import { ManageHomeContent } from "@/components/manage-home-content"

export const metadata = {
  title: "Manage Home | Jagannathapuri Admin",
  description: "Configure your storefront homepage sections",
}

export default async function ManageHomePage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <ManageHomeContent />
}
