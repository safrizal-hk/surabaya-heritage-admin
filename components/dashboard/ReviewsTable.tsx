"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Review, Place, User, useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Star,
  Trash2,
  Edit,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 6;

interface ReviewsTableProps {
  initialReviews: Review[];
  initialPlaces: Place[];
  initialUsers: User[];
}

export default function ReviewsTable({
  initialReviews,
  initialPlaces,
  initialUsers
}: ReviewsTableProps) {
  const { reviews: contextReviews, places: contextPlaces, users: contextUsers, deleteReview } = useDB();
  const { toast } = useToast();

  const reviews = contextReviews.length > 0 ? contextReviews : initialReviews;
  const places = contextPlaces.length > 0 ? contextPlaces : initialPlaces;
  const users = contextUsers.length > 0 ? contextUsers : initialUsers;

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Confirm Modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Helpers to get place and user info
  const getPlaceName = (placeId: number) => {
    const pl = places.find((p) => p.id === placeId);
    return pl ? pl.name : "Deleted Place";
  };

  const getUserDetails = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user
      ? { name: user.name, avatar: user.avatar_url }
      : { name: "Deleted User", avatar: "" };
  };

  // Filter reviews
  const filteredReviews = reviews
    .filter((review) => {
      const placeName = getPlaceName(review.place_id).toLowerCase();
      const user = getUserDetails(review.user_id);
      const userName = user.name.toLowerCase();
      const commentText = review.comment.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        placeName.includes(query) ||
        userName.includes(query) ||
        commentText.includes(query);

      const matchesRating =
        ratingFilter === "all" || review.rating === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null) {
      const success = await deleteReview(deleteConfirmId);
      if (success) {
        toast({
          title: "Review Deleted",
          description: "Review has been successfully removed from database.",
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
          title: "Delete Failed",
          description: "Could not remove user review.",
          type: "error",
        });
      }
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-955">Review Moderation</h1>
        <p className="text-sm text-zinc-500 font-medium">
          Moderate, update, and review ratings submitted by mobile application users.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search reviews by comments, landmarks, or reviewer names..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 border-zinc-200"
            />
          </div>

          <div className="w-full md:w-64">
            {/* Rating Filter Dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex h-9.5 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">All Ratings (1-5 Stars)</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table List */}
      <Card className="w-full overflow-hidden bg-white border-zinc-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 font-bold uppercase tracking-wider" style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B" }}>
                  <th className="p-4 font-semibold">Reviewer</th>
                  <th className="p-4 font-semibold">Heritage Landmark</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold">User Comment</th>
                  <th className="p-4 font-semibold">Date Submitted</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((review) => {
                    const user = getUserDetails(review.user_id);
                    return (
                      <tr
                        key={review.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30 transition-colors"
                      >
                        {/* User Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-zinc-200 shrink-0">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B" }}>
                                {user.name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-zinc-950 truncate max-w-[150px]">{user.name}</span>
                          </div>
                        </td>

                        {/* Place Name */}
                        <td className="p-4 font-bold text-zinc-900 text-sm">
                          {getPlaceName(review.place_id)}
                        </td>

                        {/* Star Rating */}
                        <td className="p-4">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating ? "fill-amber-500 text-amber-500" : "text-zinc-200"
                                }`}
                              />
                            ))}
                          </div>
                        </td>

                        {/* Comment */}
                        <td className="p-4 max-w-xs text-zinc-650 italic leading-relaxed pr-6 text-xs">
                          <span className="line-clamp-2">&ldquo;{review.comment}&rdquo;</span>
                        </td>

                        {/* Submission Date */}
                        <td className="p-4 text-zinc-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/reviews/${review.id}/edit`}>
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
                              onClick={() => setDeleteConfirmId(review.id)}
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
                    <td colSpan={6} className="text-center py-12 text-zinc-400 font-medium">
                      No reviews found matching your search.
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
                of <span className="font-semibold text-zinc-900">{totalItems}</span> reviews
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
              <ShieldAlert className="h-5 w-5" />
              <span>Delete User Review</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-zinc-650 leading-relaxed">
              Are you sure you want to permanently delete this user review from the database? This action is irreversible and will update average star statistics for the target landmark.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} className="cursor-pointer">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
