"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Building,
  Flag,
  Compass,
  BookOpen,
  Trees,
  Utensils,
  Church,
  MapPin,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mapping string names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Building: Building,
  Flag: Flag,
  Compass: Compass,
  BookOpen: BookOpen,
  Trees: Trees,
  Utensils: Utensils,
  Church: Church,
  MapPin: MapPin,
  HelpCircle: HelpCircle,
};

export default function CreateCategoryPage() {
  const { createCategory } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Building");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableIcons = [
    "Building",
    "Flag",
    "Compass",
    "BookOpen",
    "Trees",
    "Utensils",
    "Church",
    "MapPin",
    "HelpCircle"
  ];

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Category name is required.";
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

    // Simulate database lag
    setTimeout(() => {
      createCategory(name.trim(), icon);
      setLoading(false);
      toast({
        title: "Category Created",
        description: `Successfully added category "${name.trim()}".`,
        type: "success",
      });
      router.push("/dashboard/categories");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/categories">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Add Heritage Category</h1>
          <p className="text-xs text-zinc-500 font-medium">Create and classification catalog a new heritage category.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-zinc-400" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs">Provide descriptive attributes for the category classification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. Monuments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`border-zinc-200 focus-visible:ring-1 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Category Icon Selector & Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category Icon</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="flex h-9.5 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  {availableIcons.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>

                {/* Live Icon preview */}
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-600">
                  <span className="text-zinc-400">Map Icon Preview:</span>
                  <span className="p-1.5 bg-white border border-zinc-150 rounded text-zinc-950 shadow-3xs inline-flex items-center justify-center">
                    {renderIcon(icon)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Form actions footer */}
          <CardFooter className="border-t border-zinc-100 p-6 flex items-center justify-end gap-3 bg-zinc-50/30">
            <Link href="/dashboard/categories">
              <Button type="button" variant="outline" className="h-9.5 text-xs cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving Category...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Category</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
