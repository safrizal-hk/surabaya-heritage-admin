"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateUserPage() {
  const { createUser } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!email.trim()) newErrors.email = "Email address is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const defaultAvatar = avatarUrl.trim() || `https://images.unsplash.com/photo-${role === "admin" ? "1534528741775-53994a69daeb" : "1507003211169-0a1dd7228f2d"}?w=120&auto=format&fit=crop&q=80`;

    // Simulate database lag
    setTimeout(() => {
      const result = createUser({
        name: name.trim(),
        email: email.trim(),
        password_hash: password.trim(),
        role,
        avatar_url: defaultAvatar,
      });

      setLoading(false);

      if (result.success) {
        toast({
          title: "User Created",
          description: `Account for "${name.trim()}" has been successfully created.`,
          type: "success",
        });
        router.push("/dashboard/users");
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Email may already be registered.",
          type: "error",
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Add User Account</h1>
          <p className="text-xs text-zinc-500 font-medium">Provision a new administrator or mobile app user account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <UserPlus className="h-4.5 w-4.5 text-zinc-400" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs">Provide descriptive attributes and access levels for the user account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Full Name <span className="text-destructive">*</span></label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="e.g. Rina Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 border-zinc-200 focus-visible:ring-1 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Email Address <span className="text-destructive">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="rina@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 border-zinc-200 focus-visible:ring-1 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 border-zinc-200 focus-visible:ring-1 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-semibold">{errors.password}</p>}
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Avatar Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Paste a direct image URL (or leave blank for default avatar)..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="pl-10 border-zinc-200 focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
                className="flex h-9.5 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="user">Mobile Application User</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </CardContent>

          {/* Form actions footer */}
          <CardFooter className="border-t border-zinc-100 p-6 flex items-center justify-end gap-3 bg-zinc-50/30">
            <Link href="/dashboard/users">
              <Button type="button" variant="outline" className="h-9.5 text-xs cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving User...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save User Account</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
