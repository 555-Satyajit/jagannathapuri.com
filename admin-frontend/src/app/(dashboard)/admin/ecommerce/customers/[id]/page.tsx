import { CustomerViewContent } from "@/components/customer-view-content"

export default async function CustomerViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CustomerViewContent customerId={resolvedParams.id} />
}
