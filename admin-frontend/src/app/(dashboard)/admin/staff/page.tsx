import { StaffContent } from "@/components/staff-content";

export default async function StaffPage() {
  // Simulate network delay for the skeleton
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <StaffContent />;
}
