"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCartStore } from "@/store/useCartStore";
import OrderSuccess from "./OrderSuccess";
import { Loader2, Truck, CreditCard, ShieldCheck, Check, Plus, Phone, Edit, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  paymentMethod: z.enum(["cod", "online"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface Address {
  id: number;
  type: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string | null;
}

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
      <div className="flex-1 space-y-10">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-200" />
              <div className="h-6 w-48 bg-zinc-200 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="h-12 bg-zinc-100 rounded-xl w-full" />
              <div className="h-12 bg-zinc-100 rounded-xl w-full" />
              <div className="h-12 bg-zinc-100 rounded-xl w-full sm:col-span-2" />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full lg:w-[400px]">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="h-7 w-40 bg-zinc-200 rounded-md mb-6" />
          <div className="space-y-4 mb-6">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-4 bg-zinc-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <hr className="border-zinc-100 my-6" />
          <div className="h-4 bg-zinc-100 rounded w-full mb-3" />
          <div className="h-4 bg-zinc-100 rounded w-full mb-6" />
          <hr className="border-zinc-100 my-6" />
          <div className="h-14 bg-zinc-200 rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "online",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [mounted, isAuthenticated, router]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setValue("email", user.email);
      const names = user.fullName.split(' ');
      setValue("firstName", names[0] || "");
      setValue("lastName", names.slice(1).join(' ') || "");
    }
  }, [user, setValue]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await fetch('/api/auth/user-addresses', {
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          handleSelectAddress(data.addresses[0]);
        } else {
          setShowAddressForm(true);
        }
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      setShowAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchAddresses();
    }
  }, [mounted, isAuthenticated]);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShowAddressForm(false);
    
    // Set form values to match selected address
    setValue("address", addr.addressLine1);
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("zipCode", addr.zipCode);
    if (addr.phone) setValue("phone", addr.phone);
  };

  const handleAddNewAddressClick = () => {
    setShowAddressForm(true);
    setSelectedAddressId(null);
    setValue("address", "");
    setValue("city", "");
    setValue("state", "");
    setValue("zipCode", "");
  };

  if (!mounted) return <CheckoutSkeleton />;
  if (!isAuthenticated) return null;

  if (orderId) {
    return <OrderSuccess orderId={orderId} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8 max-w-md">Looks like you haven't added any items to your cart yet. Let's find something special for you.</p>
        <Link href="/shop">
          <Button className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping as requested
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      // If user typed a new address, save it to their profile automatically
      if (showAddressForm) {
        const addrRes = await fetch('/api/auth/user-address-add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'Home',
            addressLine1: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: 'India',
            phone: data.phone
          })
        });
        const addrResult = await addrRes.json();
        if (!addrResult.success) {
          console.error("Failed to add address", addrResult.error);
        }
      }

      // Sync cart with backend before checkout
      const syncRes = await fetch('/api/auth/cart/add-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.quantity })) })
      });
      await syncRes.json();

      // Submit checkout
      const checkoutRes = await fetch('/api/auth/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          country: 'India',
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          addressLine1: data.address,
          paymentMethod: data.paymentMethod === 'online' ? 'Razorpay' : 'Cash on Delivery'
        })
      });
      
      const checkoutResult = await checkoutRes.json();
      
      if (checkoutResult.success) {
        if (checkoutResult.isRazorpay) {
          const res = await loadRazorpayScript();
          if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setIsSubmitting(false);
            return;
          }

          const options = {
            key: checkoutResult.keyId,
            amount: checkoutResult.amount,
            currency: "INR",
            name: "Jay Subhdra",
            description: "Order Payment",
            order_id: checkoutResult.razorpayOrderId,
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/auth/verify-razorpay-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    orderNumber: checkoutResult.orderNumber
                  })
                });
                
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  setOrderId(checkoutResult.orderNumber);
                  clearCart();
                } else {
                  alert("Payment verification failed. " + (verifyData.message || ""));
                }
              } catch (err) {
                console.error("Verification error", err);
                alert("Payment verification failed.");
              } finally {
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              contact: data.phone
            },
            theme: {
              color: "#ea580c" // Tailwind orange-600
            },
            modal: {
              ondismiss: function() {
                setIsSubmitting(false);
              }
            }
          };

          const paymentObject = new (window as any).Razorpay(options);
          paymentObject.open();
        } else {
          setOrderId(checkoutResult.orderNumber);
          clearCart();
          setIsSubmitting(false);
        }
      } else {
        alert(checkoutResult.error || "Failed to place order.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left Column: Form */}
      <div className="flex-1">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">1</span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field>
                <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">First Name</FieldLabel>
                <Input 
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                  className="h-12"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
              </Field>
              <Field>
                <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">Last Name</FieldLabel>
                <Input 
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                  className="h-12"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">Email Address</FieldLabel>
                <Input 
                  {...register("email")}
                  type="email"
                  aria-invalid={!!errors.email}
                  className="h-12"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">Phone Number</FieldLabel>
                <Input 
                  {...register("phone")}
                  type="tel"
                  aria-invalid={!!errors.phone}
                  className="h-12"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
              </Field>
            </div>
          </section>

          <hr className="border-zinc-100" />

          {/* Shipping Address */}
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">2</span>
              Shipping Address
            </h2>
            
            {isLoadingAddresses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                <div className="h-[140px] bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="h-5 w-20 bg-zinc-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="h-[140px] bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="h-5 w-20 bg-zinc-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saved Addresses List */}
                {addresses.length > 0 && !showAddressForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`border rounded-2xl p-5 cursor-pointer transition-all relative group ${selectedAddressId === addr.id ? 'border-orange-500 bg-orange-50/50 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 shadow-sm">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            {addr.type}
                          </span>
                          {selectedAddressId === addr.id && (
                            <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-zinc-900 font-bold leading-relaxed">{addr.addressLine1}</p>
                        <p className="text-sm text-zinc-600 mt-1">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-sm text-zinc-500 mt-1">{addr.country}</p>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleAddNewAddressClick}
                      className="border-2 border-dashed border-zinc-200 rounded-2xl p-5 flex flex-col items-center justify-center text-zinc-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/50 transition-colors gap-2 min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-orange-500 group-hover:border-orange-200">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">Add New Address</span>
                    </button>
                  </div>
                )}
                
                {/* New Address Form */}
                {(showAddressForm || addresses.length === 0) && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    {addresses.length > 0 && (
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          Add a New Address
                        </h3>
                        <button type="button" onClick={() => { setShowAddressForm(false); if(addresses.length > 0) handleSelectAddress(addresses[0]); }} className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-colors">
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field className="sm:col-span-2">
                        <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">Street Address</FieldLabel>
                        <Input 
                          {...register("address")}
                          aria-invalid={!!errors.address}
                          className="h-12 bg-zinc-50"
                          placeholder="123 Main St, Apt 4B"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address.message}</p>}
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">City</FieldLabel>
                        <Input 
                          {...register("city")}
                          aria-invalid={!!errors.city}
                          className="h-12 bg-zinc-50"
                          placeholder="Mumbai"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city.message}</p>}
                      </Field>
                      <Field>
                        <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">State</FieldLabel>
                        <Input 
                          {...register("state")}
                          aria-invalid={!!errors.state}
                          className="h-12 bg-zinc-50"
                          placeholder="Maharashtra"
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1 font-medium">{errors.state.message}</p>}
                      </Field>
                      <Field>
                        <FieldLabel className="mb-1 text-sm font-medium text-zinc-700">Zip Code</FieldLabel>
                        <Input 
                          {...register("zipCode")}
                          aria-invalid={!!errors.zipCode}
                          className="h-12 bg-zinc-50"
                          placeholder="400001"
                        />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.zipCode.message}</p>}
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <hr className="border-zinc-100" />

          {/* Payment Method */}
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">3</span>
              Payment Method
            </h2>
            <div className="space-y-4">
              <label className={`block border ${paymentMethod === 'online' ? 'border-orange-500 bg-orange-50/50' : 'border-zinc-200 bg-white'} rounded-2xl p-5 cursor-pointer transition-colors relative`}>
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-orange-600' : 'border-zinc-300'}`}>
                    {paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />}
                  </div>
                  <input type="radio" value="online" {...register("paymentMethod")} className="sr-only" />
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900">Online Pay</p>
                    <p className="text-sm text-zinc-500">Pay securely via UPI, Credit/Debit Card, or Netbanking.</p>
                  </div>
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </label>

              <label className={`block border ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50' : 'border-zinc-200 bg-white'} rounded-2xl p-5 cursor-pointer transition-colors relative`}>
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-600' : 'border-zinc-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />}
                  </div>
                  <input type="radio" value="cod" {...register("paymentMethod")} className="sr-only" />
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900">Cash on Delivery</p>
                    <p className="text-sm text-zinc-500">Pay with cash when your order is delivered.</p>
                  </div>
                  <Truck className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </label>
            </div>
          </section>

        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full lg:w-[400px]">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 sticky top-32 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h3>
          
          <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-zinc-50 rounded-lg overflow-hidden flex-shrink-0 relative border border-zinc-100">
                  {item.image && <Image src={item.image.startsWith('/') || item.image.startsWith('http') ? item.image : getImageUrl(item.image)} alt={item.name} fill className="object-cover" />}
                  <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-2">{item.name}</h4>
                  <p className="font-bold text-zinc-900 mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-zinc-100 my-6" />

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span className="font-medium text-green-600 uppercase tracking-wider text-xs">Free</span>
            </div>
          </div>

          <hr className="border-zinc-100 my-6" />

          <div className="flex justify-between items-end mb-8">
            <span className="text-zinc-900 font-bold">Total</span>
            <span className="text-3xl font-extrabold text-zinc-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <Button 
            type="submit" 
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              paymentMethod === 'cod' ? "Place Order (COD)" : "Proceed to Payment"
            )}
          </Button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure Encrypted Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
