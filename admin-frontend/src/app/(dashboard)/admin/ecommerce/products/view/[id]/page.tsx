import { ViewProductContent } from "@/components/view-product-content";

export default async function ViewProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <ViewProductContent productId={id} />;
}
