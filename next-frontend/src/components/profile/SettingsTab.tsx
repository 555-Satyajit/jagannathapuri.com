"use client";

import { Bell, Shield, Smartphone, Mail, CreditCard } from "lucide-react";
import { useState } from "react";

export default function SettingsTab() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/user-change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsChangingPassword(false);
          setSuccess("");
        }, 3000);
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Account Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your preferences and security settings.</p>
      </div>

      <div className="space-y-8">
        {/* Notifications */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" /> Notifications
          </h2>
          <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Email Updates</p>
                  <p className="text-sm text-zinc-500">Receive order confirmations and tracking updates via email.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
            
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">SMS Notifications</p>
                  <p className="text-sm text-zinc-500">Get text messages when your order is out for delivery.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" /> Security
          </h2>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5">
            {!isChangingPassword ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Password</p>
                  <p className="text-sm text-zinc-500">Secure your account with a strong password</p>
                </div>
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition-colors w-fit"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <p className="font-bold text-zinc-900 mb-1">Update Password</p>
                  <p className="text-xs text-zinc-500 mb-4">Leave Current Password empty if you logged in via Google or Email OTP.</p>
                </div>
                
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}
                {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-xl border border-green-100">{success}</div>}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Current Password (optional)</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Save Password'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setError('');
                      setSuccess('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
