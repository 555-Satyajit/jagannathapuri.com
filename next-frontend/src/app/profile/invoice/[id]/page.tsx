"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Loader2, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`/api/auth/user-order-details-api/${params.id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || "Order not found");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching order invoice:", err);
        setError("Failed to load invoice");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Package className="w-16 h-16 text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invoice Not Found</h1>
        <p className="text-zinc-500">{error || "We couldn't find the invoice you're looking for."}</p>
        <Button onClick={() => window.close()} className="mt-6 bg-zinc-900 text-white rounded-xl">
          Close Window
        </Button>
      </div>
    );
  }

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Controls (Hidden when printing) */}
        <div className="flex justify-end gap-4 mb-6 print:hidden">
          <Button onClick={() => window.close()} variant="outline" className="rounded-xl border-zinc-200">
            Close
          </Button>
          <Button onClick={printInvoice} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md gap-2">
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </Button>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-100 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">INVOICE</h1>
              <p className="text-zinc-500 mt-1">Order #{order.orderNumber || order.id}</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-xl font-bold text-orange-600">Jay Subhdra</h2>
              <p className="text-zinc-500 text-sm mt-1">Sacred Treasures from Puri</p>
              <p className="text-zinc-500 text-sm">Grand Road, Puri, Odisha 752001</p>
              <p className="text-zinc-500 text-sm">support@jaysubhdra.com</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Billed To</h3>
              <p className="font-bold text-zinc-900">{order.customer?.fullName || order.name || 'Customer'}</p>
              <p className="text-zinc-600 text-sm mt-1">{order.customer?.email || order.email}</p>
              <p className="text-zinc-600 text-sm">{order.customer?.phone || order.phone}</p>
              
              {order.shippingAddress && (
                <div className="mt-3 text-sm text-zinc-600">
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                </div>
              )}
            </div>
            <div className="sm:text-right">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Invoice Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-zinc-500">Invoice Date:</span>
                  <span className="font-medium text-zinc-900">
                    {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-zinc-500">Payment Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-zinc-500">Payment Method:</span>
                  <span className="font-medium text-zinc-900 capitalize">{order.paymentMethod || 'Online'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {order.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-sm">
                      <p className="font-medium text-zinc-900">{item.product?.product_name || 'Product Item'}</p>
                      {item.product?.sku && <p className="text-xs text-zinc-500 mt-0.5">SKU: {item.product.sku}</p>}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-zinc-600">{item.quantity}</td>
                    <td className="py-4 px-4 text-sm text-right text-zinc-600">₹{item.price}</td>
                    <td className="py-4 px-4 text-sm text-right font-medium text-zinc-900">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-1/2 md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium text-zinc-900">₹{order.subtotal || order.totalAmount || order.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span className="font-medium text-zinc-900">₹{order.shippingCost || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tax</span>
                <span className="font-medium text-zinc-900">₹{order.taxAmount || 0}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-200">
                <span className="font-bold text-zinc-900">Total</span>
                <span className="font-bold text-orange-600 text-xl">₹{order.totalAmount || order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-zinc-100 text-center text-sm text-zinc-400">
            <p>Thank you for shopping with Jay Subhdra.</p>
            <p className="mt-1">This is a computer generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
