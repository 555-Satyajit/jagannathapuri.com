import { AddProductContent } from "@/components/add-product-content";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <AddProductContent editId={id} />;
}
