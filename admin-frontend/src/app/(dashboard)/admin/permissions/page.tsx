import { PermissionsContent } from "@/components/permissions-content";

export default async function PermissionsPage() {
  // Simulate network delay for the skeleton
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <PermissionsContent />;
}
