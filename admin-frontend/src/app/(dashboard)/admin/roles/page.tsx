import { RolesContent } from "@/components/roles-content";

export default async function RolesPage() {
  // Simulate network delay for the skeleton
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <RolesContent />;
}
