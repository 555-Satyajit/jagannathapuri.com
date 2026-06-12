"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const addressSchema = z.object({
  type: z.string().min(1, "Address type is required (e.g. Home, Work)"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code must be valid"),
  phone: z.string().min(10, "Phone number must be at least 10 digits")
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressManager() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "Home"
    }
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/auth/user-addresses", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    reset({ type: "Home", addressLine1: "", city: "", state: "", zipCode: "", phone: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: any) => {
    setEditingId(address.id);
    reset({
      type: address.type,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone || ""
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    const endpoint = editingId ? `/api/auth/user-address-edit/${editingId}` : "/api/auth/user-address-add";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setIsDialogOpen(false);
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to save address", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/auth/user-address-delete/${id}`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(prev => prev.filter((a: any) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-zinc-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-48 bg-zinc-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-10 w-28 bg-zinc-200 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 relative shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 w-16 bg-zinc-200 rounded-md"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-zinc-200 rounded-md"></div>
                  <div className="w-8 h-8 bg-zinc-200 rounded-md"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-zinc-200 rounded-full"></div>
                <div className="h-4 w-full bg-zinc-200 rounded-full"></div>
                <div className="h-4 w-1/2 bg-zinc-200 rounded-full"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <div className="h-4 w-1/3 bg-zinc-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Saved Addresses</h2>
          <p className="text-zinc-500 text-sm mt-1">Manage your delivery addresses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={<Button onClick={openAddDialog} className="bg-orange-600 hover:bg-orange-700 text-white gap-2" />}
          >
            <Plus className="w-4 h-4" /> Add New
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Address Type (Home, Work, etc.)</Label>
                <Input {...register("type")} />
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input {...register("addressLine1")} />
                {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...register("city")} />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input {...register("state")} />
                  {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input {...register("zipCode")} />
                  {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? "Update Address" : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
            <MapPin className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-zinc-900 font-bold mb-1">No addresses saved</h3>
          <p className="text-zinc-500 text-sm">Add an address to speed up your checkout process.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white border border-zinc-200 rounded-2xl p-5 relative group shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {address.type}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditDialog(address)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAddress(address.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-zinc-900 font-medium">{address.addressLine1}</p>
              <p className="text-zinc-500 text-sm mt-1">{address.city}, {address.state} {address.zipCode}</p>
              <p className="text-zinc-500 text-sm">{address.country}</p>
              {address.phone && <p className="text-zinc-600 text-sm mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2">
                <span className="font-medium">Phone:</span> {address.phone}
              </p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
