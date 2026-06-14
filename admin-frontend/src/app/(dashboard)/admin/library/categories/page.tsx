import { LibraryManagementContent } from "@/components/library-management-content";

export default async function LibraryCategoriesPage() {
  // Artificial delay for the skeleton UI to show
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return <LibraryManagementContent />;
}
