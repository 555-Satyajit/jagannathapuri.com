import { AdminHeroEdit } from "@/components/admin-hero-edit"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdminHeroEdit id={resolvedParams.id} />
}
