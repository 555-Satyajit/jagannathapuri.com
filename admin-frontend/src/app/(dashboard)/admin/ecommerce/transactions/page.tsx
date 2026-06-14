import { TransactionsContent } from "@/components/transactions-content"

export const metadata = {
  title: "Transactions | Jay Subhdra Admin",
  description: "Manage eCommerce transactions",
}

export default async function TransactionsPage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <TransactionsContent />
}
