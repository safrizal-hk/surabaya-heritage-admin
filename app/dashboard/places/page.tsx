"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDB, Place } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  Landmark,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 5;

export default function PlacesListPage() {
  const { places, categories, placePhotos, deletePlace } = useDB();
  const { toast } = useToast();

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Helper to find category name
  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  // Helper to find primary photo
  const getPrimaryPhoto = (placeId: number) => {
    const photo = placePhotos.find((p) => p.place_id === placeId && p.is_primary);
    return photo ? photo.photo_url : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=60";
  };

  // Filter logic
  const filteredPlaces = places
    .filter((place) => {
      const matchesSearch =
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "all" || place.category_id === parseInt(selectedCategory);

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && place.is_active) ||
        (selectedStatus === "inactive" && !place.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "rating-desc") {
        return b.avg_rating - a.avg_rating;
      }
      return 0;
    });

  // Pagination calculations
  const totalItems = filteredPlaces.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (type: string, value: string) => {
    if (type === "category") setSelectedCategory(value);
    if (type === "status") setSelectedStatus(value);
    if (type === "sort") setSortBy(value);
    setCurrentPage(1);
  };

  // Delete execution
  const handleDeletePlace = () => {
    if (deleteConfirmId !== null) {
      const success = deletePlace(deleteConfirmId);
      if (success) {
        toast({
          title: "Place Deleted",
          description: "The heritage location was successfully removed from database.",
          type: "success",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "An error occurred while trying to delete the location.",
          type: "error",
        });
      }
      setDeleteConfirmId(null);
      
      // Adjust page if current page becomes empty
      const updatedTotal = totalItems - 1;
      const updatedPages = Math.ceil(updatedTotal / ITEMS_PER_PAGE) || 1;
      if (currentPage > updatedPages) {
        setCurrentPage(updatedPages);
      }
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Heritage Places</h1>
          <p className="text-sm text-zinc-500 font-medium">
            Manage your historical landmarks, locations, coordinate map picker and photos.
          </p>
        </div>
        <Link href="/dashboard/places/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Create New Place</span>
          </Button>
        </Link>
      </div>

      {/* Filter and search bar */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search places by name or address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 border-zinc-200"
              />
            </div>

            {/* Quick dropdown selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-[500px]">
              {/* Category Filter */}
              <div className="flex flex-col gap-1.5">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex flex-col gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="newest">Newest Added</option>
                  <option value="oldest">Oldest Added</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="rating-desc">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Places Table card */}
      <Card className="w-full overflow-hidden bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4 font-semibold">Thumbnail</th>
                  <th className="p-4 font-semibold">Place Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Address</th>
                  <th className="p-4 font-semibold">Avg Rating</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date Added</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlaces.length > 0 ? (
                  paginatedPlaces.map((place) => (
                    <tr
                      key={place.id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30 transition-colors"
                    >
                      {/* Photo Thumbnail */}
                      <td className="p-4">
                        <img
                          src={getPrimaryPhoto(place.id)}
                          alt={place.name}
                          className="w-12 h-12 object-cover rounded-lg border border-zinc-200 shadow-3xs"
                        />
                      </td>

                      {/* Name & Slug */}
                      <td className="p-4 font-bold text-zinc-950">
                        <div className="flex flex-col">
                          <span>{place.name}</span>
                          <span className="text-[10px] text-zinc-400 font-normal mt-0.5">/{place.slug}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-zinc-600 font-medium">
                        {getCategoryName(place.category_id)}
                      </td>

                      {/* Address */}
                      <td className="p-4 max-w-xs text-zinc-500 font-medium truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                          <span className="truncate">{place.address}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-zinc-900">{place.avg_rating || "New"}</span>
                          {place.review_count > 0 && (
                            <span className="text-[10px] text-zinc-400 font-normal">({place.review_count})</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {place.is_active ? (
                          <Badge variant="success" className="gap-1 text-[10px] font-bold">
                            <CheckCircle className="h-3 w-3" />
                            <span>Active</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-[10px] font-bold">
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </Badge>
                        )}
                      </td>

                      {/* Creation date */}
                      <td className="p-4 text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(place.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/places/${place.id}/edit`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-zinc-600 border-zinc-200 cursor-pointer">
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive border-zinc-200 hover:bg-destructive/5 hover:text-destructive cursor-pointer animate-fade-in"
                            onClick={() => setDeleteConfirmId(place.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-zinc-400 font-medium">
                      No heritage places match your search criteria.
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
                of <span className="font-semibold text-zinc-900">{totalItems}</span> places
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
              <span>Confirm Permanent Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-zinc-600 leading-relaxed">
              Are you sure you want to delete this place? This action is permanent and will cascade delete all associated photographs, reviews, and bookmarks from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeletePlace} className="cursor-pointer">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
