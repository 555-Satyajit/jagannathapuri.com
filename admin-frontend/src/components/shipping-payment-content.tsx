"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ShippingPaymentContent() {
  const [upiEnabled, setUpiEnabled] = React.useState(true)

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Configuration</CardTitle>
            <CardDescription>Configure delivery rates and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Flat Rate (₹)</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Threshold (₹)</Label>
                <Input type="number" defaultValue="500" />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-medium">Enabled Shipping Methods</h3>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Flat Rate</Label>
                    <p className="text-sm text-muted-foreground">Charge a standard fixed fee for deliveries.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Free Shipping</Label>
                    <p className="text-sm text-muted-foreground">Waive shipping fees when the threshold is met.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>Manage payment gateways and methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Available Methods</h3>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Cash on Delivery (COD)</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to pay physically upon delivery.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">UPI (GPay, PhonePe, etc.)</Label>
                    <p className="text-sm text-muted-foreground">Accept direct bank transfers via UPI.</p>
                  </div>
                  <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Credit/Debit Card (Razorpay/Stripe)</Label>
                    <p className="text-sm text-muted-foreground">Process major credit and debit cards globally.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {upiEnabled && (
              <div className="border-t pt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label>Store UPI ID</Label>
                <Input defaultValue="store@okaxis" placeholder="vpa@bank" className="max-w-md" />
                <p className="text-xs text-muted-foreground">Payments will be routed directly to this UPI address.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg">Save All Settings</Button>
        </div>
      </form>
    </div>
  )
}
