import { CouponsContent } from "@/components/coupons-content";

export default async function CouponsPage() {
  // Simulate network delay for the skeleton
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <CouponsContent />;
}
