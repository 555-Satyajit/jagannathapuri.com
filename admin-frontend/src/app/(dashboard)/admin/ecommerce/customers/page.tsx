import { CustomersContent } from "@/components/customers-content"

export const metadata = {
  title: "Customers | Jagannathapuri Admin",
  description: "Manage eCommerce customers",
}

export default async function CustomersPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <CustomersContent />
}
