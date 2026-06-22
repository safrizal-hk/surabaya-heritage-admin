"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Category, Place, useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 5;

const iconMap: Record<string, React.ComponentType<any>> = {
  Building,
  Flag,
  Compass,
  BookOpen,
  Trees,
  Utensils,
  Church,
  MapPin,
  HelpCircle,
};

interface CategoriesTableProps {
  initialCategories: Category[];
  initialPlaces: Place[];
}

export default function CategoriesTable({
  initialCategories,
  initialPlaces
}: CategoriesTableProps) {
  const { categories: contextCategories, places: contextPlaces, deleteCategory } = useDB();
  const { toast } = useToast();

  // Use context data if available (loaded), otherwise fall back to SSR initial data
  const categories = contextCategories.length > 0 ? contextCategories : initialCategories;
  const places = contextPlaces.length > 0 ? contextPlaces : initialPlaces;

  // Search/Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter Categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Render Icon helper
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  // Delete category action
  const handleDeleteCategory = async () => {
    if (deleteConfirmId !== null) {
      const result = await deleteCategory(deleteConfirmId);
      if (result.success) {
        toast({
          title: "Category Deleted",
          description: "The category has been successfully removed from database.",
          type: "success",
        });

        // Adjust page if current page becomes empty
        const updatedTotal = totalItems - 1;
        const updatedPages = Math.ceil(updatedTotal / ITEMS_PER_PAGE) || 1;
        if (currentPage > updatedPages) {
          setCurrentPage(updatedPages);
        }
      } else {
        toast({
          title: "Deletion Prevented",
          description: result.error || "Cannot delete category linked to heritage places.",
          type: "error",
        });
      }
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Heritage Categories</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Manage place classification categories and their dynamic map icons.
          </p>
        </div>
        <Link href="/dashboard/categories/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Create New Category</span>
          </Button>
        </Link>
      </div>

      {/* Filter and search bar */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-4 sm:p-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search categories by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 border-zinc-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table Card */}
      <Card className="w-full overflow-hidden bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 font-bold uppercase tracking-wider" style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B" }}>
                  <th className="p-4 font-semibold w-24 text-center">Icon</th>
                  <th className="p-4 font-semibold">Category Name</th>
                  <th className="p-4 font-semibold">Linked Places</th>
                  <th className="p-4 font-semibold">Date Created</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat) => {
                    const count = places.filter((p) => p.category_id === cat.id).length;
                    return (
                      <tr
                        key={cat.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30 transition-colors"
                      >
                        {/* Category Icon */}
                        <td className="p-4 text-center">
                          <div className="inline-flex p-2 rounded-md shadow-3xs" style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B", border: "1px solid #E8D0A0" }}>
                            {renderIcon(cat.icon)}
                          </div>
                        </td>

                        {/* Category Name */}
                        <td className="p-4 font-bold text-zinc-950 text-sm">
                          {cat.name}
                        </td>

                        {/* Places Count */}
                        <td className="p-4 text-zinc-600 font-semibold">
                          <span className="px-2 py-0.5 rounded-sm text-xs font-semibold" style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B", border: "1px solid #E8D0A0" }}>
                            {count} {count === 1 ? "place" : "places"}
                          </span>
                        </td>

                        {/* Date Created */}
                        <td className="p-4 text-zinc-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            {new Date(cat.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/categories/${cat.id}/edit`}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-zinc-200 cursor-pointer"
                                style={{ color: "#1B3A6B" }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive border-zinc-200 hover:bg-destructive/5 hover:text-destructive cursor-pointer"
                              onClick={() => setDeleteConfirmId(cat.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-400 font-medium">
                      No categories match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200/80 p-4 bg-zinc-50/50">
              <div className="text-xs text-zinc-500">
                Showing <span className="font-semibold text-zinc-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-semibold text-zinc-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-zinc-900">{totalItems}</span> categories
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Confirm Category Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-zinc-600 leading-relaxed">
              Are you sure you want to delete this category? This action is permanent and will remove it from database. If there are heritage places linked to this category, deletion will be prevented.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteCategory} className="cursor-pointer">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
