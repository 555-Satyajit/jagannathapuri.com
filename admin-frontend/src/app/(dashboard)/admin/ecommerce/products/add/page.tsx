import { AddProductContent } from "@/components/add-product-content";

export default async function AddProductPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <AddProductContent />;
}
