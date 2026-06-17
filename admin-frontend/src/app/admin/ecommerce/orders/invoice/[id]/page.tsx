"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminInvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    
    // Uses the admin API to get the order
    fetch(`/api/admin/ecommerce/orders/view/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
          setSiteConfig(data.siteConfig);
        } else {
          setError(data.error || "Order not found");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin invoice:", err);
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

  const getPaymentStatusText = (status: number | string) => {
    switch (Number(status)) {
      case 1: return "Paid";
      case 2: return "Pending";
      case 3: return "Failed";
      case 4: return "Cancelled";
      default: return "Pending";
    }
  };

  const subtotal = parseFloat(order.subtotal || order.totalAmount || order.total || 0);
  const tax = ((subtotal * 18) / 118).toFixed(2);
  const shipping = parseFloat(order.shippingCost || order.shippingFee || 0);
  const total = parseFloat(order.totalAmount || order.total || 0);

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[800px] mx-auto">
        {/* Controls */}
        <div className="flex justify-end gap-4 mb-6 print:hidden">
          <Button onClick={() => window.close()} variant="outline" className="rounded-xl border-zinc-200">
            Close
          </Button>
          <Button onClick={printInvoice} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md gap-2">
            <Printer className="w-4 h-4" /> Print PDF
          </Button>
        </div>

        {/* Invoice Paper (Matches Design exactly) */}
        <div className="bg-white shadow-sm border border-zinc-200 print:shadow-none print:border-none w-full relative">
          
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-zinc-200 p-10 print:p-0 print:pb-8 print:pt-4">
            <div className="flex flex-col">
              {siteConfig?.header?.logo ? (
                <img src={siteConfig.header.logo} alt="Logo" className="h-8 object-contain mb-2" />
              ) : (
                <h1 className="text-4xl font-bold text-zinc-900 mb-1" style={{ letterSpacing: '-0.02em' }}>Invoice</h1>
              )}
              <p className="text-zinc-500 text-sm">{siteConfig?.contact?.brand_description || 'Jagannathapuri E-commerce'}</p>
            </div>
            
            <div className="flex border-l border-zinc-200 pl-6 text-sm">
              <table className="text-right border-spacing-y-1 border-separate">
                <tbody>
                  <tr>
                    <td className="text-zinc-900 font-medium pr-4">Invoice #</td>
                    <td className="text-zinc-600">{order.orderNumber || order.id}</td>
                  </tr>
                  <tr>
                    <td className="text-zinc-900 font-medium pr-4">Issue Date</td>
                    <td className="text-zinc-600">{new Date(order.date || order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td className="text-zinc-900 font-medium pr-4">Due Date</td>
                    <td className="text-zinc-600">{new Date(order.date || order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill To & Total Due */}
          <div className="flex justify-between items-start p-10 print:p-0 print:py-8">
            <div className="text-sm">
              <h3 className="font-bold text-zinc-900 mb-2">Bill To:</h3>
              <p className="text-zinc-600">{order.customer?.fullName || order.name || 'Customer'}</p>
              {order.shippingAddress && (
                <div className="text-zinc-600">
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="font-bold text-zinc-900 text-sm mb-1">Total Due:</h3>
              <div className="text-4xl font-bold text-zinc-800" style={{ letterSpacing: '-0.03em' }}>
                ₹{total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-10 print:px-0">
            <table className="w-full text-sm border border-zinc-200">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <th className="py-3 px-4 text-left font-bold text-zinc-900 text-xs tracking-wider">CHARGES</th>
                  <th className="py-3 px-4 font-bold text-zinc-900 text-xs tracking-wider text-center border-l border-zinc-200 w-32">QUANTITY</th>
                  <th className="py-3 px-4 font-bold text-zinc-900 text-xs tracking-wider text-right border-l border-zinc-200 w-40">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-zinc-800 align-top">
                      <p className="font-medium">{item.product?.product_name || 'Product Item'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Unit Price: ₹{item.price}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-800 align-top border-l border-zinc-200">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-800 align-top border-l border-zinc-200">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals */}
          <div className="flex justify-end px-10 print:px-0 mt-8 mb-12">
            <div className="w-full sm:w-1/2 md:w-[45%] border border-zinc-200 p-6 text-sm">
              <div className="flex justify-between mb-3 text-zinc-800">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3 text-zinc-800">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-zinc-800">
                <span>Includes 18% Tax</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-zinc-200 font-bold text-zinc-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Info (Payments, Contact, etc) */}
          <div className="flex justify-between border-t border-zinc-200 p-10 print:p-0 print:pt-8 bg-zinc-50/30 text-sm text-zinc-600 h-full">
            <div className="w-1/3 pr-4">
              <h4 className="font-bold text-zinc-900 mb-2">Payments & Status:</h4>
              <p className="mb-1">Payment Method: <span className="text-zinc-900 uppercase font-medium">{order.paymentMethod || 'Cash on Delivery'}</span></p>
              <p className="mb-1">Payment Status: <span className="text-zinc-900 font-medium">{getPaymentStatusText(order.paymentStatus || order.payment)}</span></p>
              <p>Order Status: <span className="text-zinc-900 font-medium">{order.status === 1 ? 'Processing' : order.status === 2 ? 'Completed' : 'Cancelled'}</span></p>
            </div>
            
            <div className="w-1/3 px-4 border-l border-zinc-200">
              <h4 className="font-bold text-zinc-900 mb-2">Contact:</h4>
              <p className="mb-1">{siteConfig?.contact?.address || 'Grand Road, Puri, Odisha, 752001'}</p>
              <p className="mb-1">{siteConfig?.contact?.email || 'support@jagannathapuri.com'}</p>
              <p>{siteConfig?.contact?.phone || '+91 6752 123456'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
