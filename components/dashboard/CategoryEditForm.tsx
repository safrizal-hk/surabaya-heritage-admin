"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category, useDB } from "@/lib/context";
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

const iconMap: Record<string, React.ComponentType<any>> = {
  Building, Flag, Compass, BookOpen, Trees, Utensils, Church, MapPin, HelpCircle,
};

interface CategoryEditFormProps {
  categoryId: number;
  initialCategory: Category | null;
}

export default function CategoryEditForm({ categoryId, initialCategory }: CategoryEditFormProps) {
  const { categories, updateCategory } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  const categoryFromContext = categories.find((c) => c.id === categoryId);
  const category = categoryFromContext || initialCategory;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Building");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableIcons = [
    "Building", "Flag", "Compass", "BookOpen",
    "Trees", "Utensils", "Church", "MapPin", "HelpCircle"
  ];

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
    }
  }, [category]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-primary">Heritage Category Not Found</h2>
        <p className="text-sm text-muted-foreground font-medium max-w-xs">
          The category you are looking to edit does not exist or has been deleted.
        </p>
        <Link href="/dashboard/categories">
          <Button variant="outline" size="sm" className="border-border text-primary hover:bg-accent">
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

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
      toast({ title: "Validation Error", description: "Please check all required fields.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const updated = await updateCategory(categoryId, name.trim(), icon);
      setLoading(false);
      if (updated) {
        toast({ title: "Category Updated", description: `Successfully modified "${name.trim()}".`, type: "success" });
        router.push("/dashboard/categories");
      } else {
        toast({ title: "Error", description: "An error occurred while updating the category.", type: "error" });
      }
    } catch (err: any) {
      setLoading(false);
      toast({ title: "Error Updating Category", description: err.message || "An unexpected error occurred.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/categories">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer border-border text-primary hover:bg-accent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Edit Heritage Category</h1>
          <p className="text-xs text-muted-foreground font-medium">Update classification details and dynamic map icon.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-accent/30 rounded-t-lg">
            <CardTitle className="text-base font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary/60" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Provide descriptive attributes for the category classification.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Monuments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm ${
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Category Icon Selector & Preview */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">Category Icon</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 cursor-pointer"
                >
                  {availableIcons.map((ico) => (
                    <option key={ico} value={ico}>{ico}</option>
                  ))}
                </select>

                {/* Live Icon Preview */}
                <div className="flex items-center gap-2.5 px-3 py-2 bg-accent/40 border border-border rounded-md text-xs font-medium text-muted-foreground">
                  <span>Map Icon Preview:</span>
                  <span className="p-1.5 bg-primary text-primary-foreground rounded shadow-sm inline-flex items-center justify-center">
                    {renderIcon(icon)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border px-6 py-4 flex items-center justify-end gap-3 bg-accent/20 rounded-b-lg">
            <Link href="/dashboard/categories">
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}