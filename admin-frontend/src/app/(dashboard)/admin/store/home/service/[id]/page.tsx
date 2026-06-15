import { AdminServiceEdit } from "@/components/admin-service-edit"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdminServiceEdit id={resolvedParams.id} />
}
