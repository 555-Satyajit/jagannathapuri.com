import { ShippingPaymentContent } from "@/components/shipping-payment-content"

export default function ShippingPaymentPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Payment Settings</h1>
          <p className="text-muted-foreground">Configure delivery rates, thresholds, and available payment gateways.</p>
        </div>
      </div>
      <ShippingPaymentContent />
    </div>
  )
}
