import { OrdersContent } from "@/components/orders-content"

export const metadata = {
  title: "Orders | Jagannathapuri Admin",
  description: "Manage eCommerce orders",
}

export default async function OrdersPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <OrdersContent />
}
