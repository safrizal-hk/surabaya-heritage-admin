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

export default function UserCreateForm() {
  const { createUser } = useDB();
  const { toast } = useToast();
  const router = useRouter();

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
      toast({ title: "Validation Error", description: "Please check all required fields.", type: "error" });
      return;
    }
    setLoading(true);
    const defaultAvatar = avatarUrl.trim() || `https://images.unsplash.com/photo-${role === "admin" ? "1534528741775-53994a69daeb" : "1507003211169-0a1dd7228f2d"}?w=120&auto=format&fit=crop&q=80`;
    try {
      const result = await createUser({
        name: name.trim(),
        email: email.trim(),
        password_hash: password.trim(),
        role,
        avatar_url: defaultAvatar,
      });
      setLoading(false);
      if (result.success) {
        toast({ title: "User Created", description: `Account for "${name.trim()}" has been successfully created.`, type: "success" });
        router.push("/dashboard/users");
      } else {
        toast({ title: "Creation Failed", description: result.error || "Email may already be registered.", type: "error" });
      }
    } catch (err: any) {
      setLoading(false);
      toast({ title: "Error Creating User", description: err.message || "An unexpected error occurred.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/users">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer border-border text-primary hover:bg-accent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Add User Account</h1>
          <p className="text-xs text-muted-foreground font-medium">Provision a new administrator or mobile app user account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-accent/30 rounded-t-lg">
            <CardTitle className="text-base font-bold text-primary flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-primary/60" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Provide descriptive attributes and access levels for the user account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
                <Input
                  placeholder="e.g. Rina Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm ${
                    errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
                <Input
                  type="email"
                  placeholder="rina@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm ${
                    errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
                <Input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm ${
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-semibold">{errors.password}</p>}
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">Avatar Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
                <Input
                  placeholder="Paste a direct image URL (or leave blank for default)..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="pl-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 cursor-pointer"
              >
                <option value="user">Mobile Application User</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border px-6 py-4 flex items-center justify-end gap-3 bg-accent/20 rounded-b-lg">
            <Link href="/dashboard/users">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs cursor-pointer border-border text-primary hover:bg-accent hover:text-primary"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="h-9 text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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