import { OrderViewContent } from "@/components/order-view-content"

export default async function OrderViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <OrderViewContent orderId={resolvedParams.id} />
}
