"use client";

import { Package, ExternalLink, MapPin, Truck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const MOCK_ORDERS = [
  {
    id: "ORD-9284-7731",
    date: "June 05, 2026",
    status: "Shipped",
    total: "₹3,450",
    items: [
      {
        name: "Hand-Carved Wooden Jagannath Idol",
        quantity: 1,
        image: "/assets/images/products/wooden-jagannath.jpg", // Mock image path
      },
      {
        name: "Pattachitra Wall Hanging",
        quantity: 1,
        image: "/assets/images/products/pattachitra-cloth-traditional-odisha-wall-hanging-2.jpg", // Mock image path
      }
    ],
    trackingNo: "AWB1239847190",
  },
  {
    id: "ORD-1102-8492",
    date: "May 22, 2026",
    status: "Delivered",
    total: "₹1,200",
    items: [
      {
        name: "Premium Chandan Powder",
        quantity: 2,
        image: "/assets/images/products/chandan.jpg", // Mock image path
      }
    ],
    trackingNo: "AWB8847109283",
  }
];

export default function OrdersTab() {
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user-orders", {credentials: "include"})
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  const getStatusString = (status: number) => {
    switch(status) {
      case 0: return 'Cancelled';
      case 1: return 'Pending';
      case 2: return 'Processing';
      case 3: return 'Shipped';
      case 4: return 'Delivered';
      default: return 'Processing';
    }
  };

  const handleDownloadInvoice = (orderId: number) => {
    // Open the new Next.js invoice page in a new tab
    window.open(`/profile/invoice/${orderId}`, '_blank');
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Order History</h1>
        <p className="text-zinc-500 mt-1">View and track your recent purchases.</p>
      </div>

      {trackingOrder ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
          <button 
            onClick={() => setTrackingOrder(null)}
            className="text-orange-600 font-semibold text-sm hover:text-orange-700 mb-6 flex items-center gap-1"
          >
            &larr; Back to Orders
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Tracking Order {trackingOrder}</h2>
              <p className="text-zinc-500 text-sm mt-1">Estimated Delivery: June 08, 2026</p>
            </div>
            <div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200 inline-flex flex-col">
              <span className="text-xs text-zinc-400 font-medium">Tracking Number</span>
              <span className="font-mono font-bold text-zinc-800">AWB1239847190</span>
            </div>
          </div>

          {/* Tracking Timeline */}
          {(() => {
            const activeOrder = orders.find(o => o.id === trackingOrder);
            const statusStr = getStatusString(activeOrder?.status || 1);
            const statusNum = activeOrder?.status || 1;
            
            return (
              <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                
                {/* Delivered Step */}
                <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${statusNum >= 4 ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${statusNum >= 4 ? 'bg-green-500 text-white shadow' : 'bg-zinc-300'}`}>
                    {statusNum >= 4 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${statusNum >= 4 ? 'bg-white border-green-100 shadow-sm shadow-green-500/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${statusNum >= 4 ? 'text-green-700' : 'text-zinc-700'}`}>Delivered</div>
                    </div>
                    <div className={`text-sm ${statusNum >= 4 ? 'text-zinc-600' : 'text-zinc-500'}`}>Package has been delivered to you.</div>
                  </div>
                </div>

                {/* Shipped Step */}
                <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${statusNum >= 3 ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${statusNum >= 3 ? 'bg-green-500 text-white shadow' : 'bg-zinc-300'}`}>
                    {statusNum >= 3 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${statusNum >= 3 ? 'bg-white border-green-100 shadow-sm shadow-green-500/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${statusNum >= 3 ? 'text-green-700' : 'text-zinc-700'}`}>Shipped</div>
                    </div>
                    <div className={`text-sm ${statusNum >= 3 ? 'text-zinc-600' : 'text-zinc-500'}`}>Package has left our facility.</div>
                  </div>
                </div>

                {/* Processing Step */}
                <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${statusNum >= 2 ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${statusNum >= 2 ? 'bg-green-500 text-white shadow' : 'bg-zinc-300'}`}>
                    {statusNum >= 2 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${statusNum >= 2 ? 'bg-white border-green-100 shadow-sm shadow-green-500/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${statusNum >= 2 ? 'text-green-700' : 'text-zinc-700'}`}>Processing</div>
                    </div>
                    <div className={`text-sm ${statusNum >= 2 ? 'text-zinc-600' : 'text-zinc-500'}`}>Your items are being packed.</div>
                  </div>
                </div>

                {/* Order Placed Step */}
                <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${statusNum >= 1 ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${statusNum >= 1 ? 'bg-green-500 text-white shadow' : 'bg-zinc-300'}`}>
                    {statusNum >= 1 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${statusNum >= 1 ? 'bg-white border-green-100 shadow-sm shadow-green-500/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${statusNum >= 1 ? 'text-green-700' : 'text-zinc-700'}`}>Order Placed</div>
                      <div className="text-xs font-medium text-zinc-400">
                        {new Date(activeOrder?.date || activeOrder?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className={`text-sm ${statusNum >= 1 ? 'text-zinc-600' : 'text-zinc-500'}`}>We received your order successfully.</div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      ) : loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm animate-pulse">
              {/* Skeleton Header */}
              <div className="bg-zinc-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-zinc-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-zinc-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-12 bg-zinc-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-zinc-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-zinc-200 rounded-full"></div>
                  </div>
                </div>
                <div className="h-6 w-20 bg-zinc-200 rounded-full"></div>
              </div>

              {/* Skeleton Body */}
              <div className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-200 rounded-xl flex-shrink-0"></div>
                    <div className="space-y-2 w-full max-w-[200px]">
                      <div className="h-4 w-full bg-zinc-200 rounded-full"></div>
                      <div className="h-3 w-12 bg-zinc-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end justify-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                  <div className="h-10 w-full sm:w-28 bg-zinc-200 rounded-xl"></div>
                  <div className="h-10 w-full sm:w-28 bg-zinc-200 rounded-xl"></div>
                  <div className="h-10 w-full sm:w-28 bg-zinc-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl">
          <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900">No orders yet</h3>
          <p className="text-zinc-500 mt-1">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusStr = getStatusString(order.status);
            return (
              <div key={order.id} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group">
                {/* Order Header */}
                <div className="bg-zinc-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-bold text-zinc-900">
                        {new Date(order.date || order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-bold text-zinc-900">₹{order.totalAmount || order.total}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Order #</p>
                      <p className="text-sm font-mono font-bold text-zinc-900">{order.orderNumber || order.id}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
                    statusStr === 'Delivered' 
                      ? 'bg-zinc-100 text-zinc-600 border-zinc-200' 
                      : statusStr === 'Cancelled'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {statusStr === 'Shipped' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    {statusStr}
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    {order.items && order.items.map((item: any, idx: number) => {
                      const product = item.product || {};
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-zinc-100 rounded-xl flex-shrink-0 relative overflow-hidden border border-zinc-200">
                            {product.images && product.images.length > 0 ? (
                              <Image 
                                src={product.images[0].startsWith('http') ? product.images[0] : `/uploads/${product.images[0]}`} 
                                alt={product.product_name} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-orange-50">
                                <Package className="w-6 h-6 text-orange-200" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                              {product.product_name || "Unknown Product"}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col sm:items-end justify-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                    <Button 
                      onClick={() => setTrackingOrder(order.id)}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all"
                    >
                      <Truck className="w-4 h-4 mr-2" /> Track Order
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl font-semibold">
                      Buy it again
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="w-full sm:w-auto text-zinc-500 hover:text-zinc-900 rounded-xl font-medium"
                    >
                      View Invoice
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
