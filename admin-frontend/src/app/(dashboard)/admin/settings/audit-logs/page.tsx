import { AuditLogsContent } from "@/components/audit-logs-content"

export const metadata = {
  title: "Audit Logs | Jay Subhdra Admin",
  description: "Monitor system activity and administrative actions",
}

export default async function AuditLogsPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <AuditLogsContent />
}
