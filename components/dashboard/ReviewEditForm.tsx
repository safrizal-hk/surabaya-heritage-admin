"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Review, Place, User, useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Star,
  Landmark
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewEditFormProps {
  reviewId: number;
  initialReview: Review | null;
  initialPlaces: Place[];
  initialUsers: User[];
}

export default function ReviewEditForm({
  reviewId, initialReview, initialPlaces, initialUsers
}: ReviewEditFormProps) {
  const { reviews, places: contextPlaces, users: contextUsers, updateReview } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  const reviewFromContext = reviews.find((r) => r.id === reviewId);
  const review = reviewFromContext || initialReview;

  const places = contextPlaces.length > 0 ? contextPlaces : initialPlaces;
  const users = contextUsers.length > 0 ? contextUsers : initialUsers;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [review]);

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-primary/40" />
        </div>
        <h2 className="text-xl font-bold text-primary">Review Not Found</h2>
        <p className="text-sm text-muted-foreground font-medium max-w-xs">
          The review you are looking to moderate does not exist or has been deleted.
        </p>
        <Link href="/dashboard/reviews">
          <Button variant="outline" size="sm" className="border-border text-primary hover:bg-accent">
            Back to Reviews
          </Button>
        </Link>
      </div>
    );
  }

  const getPlaceName = (placeId: number) => {
    const pl = places.find((p) => p.id === placeId);
    return pl ? pl.name : "Deleted Place";
  };

  const getUserDetails = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? { name: user.name, avatar: user.avatar_url } : { name: "Deleted User", avatar: "" };
  };

  const reviewer = getUserDetails(review.user_id);
  const placeName = getPlaceName(review.place_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!comment.trim()) newErrors.comment = "Review comment is required.";
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
      const updated = await updateReview(reviewId, rating, comment.trim());
      setLoading(false);
      if (updated) {
        toast({ title: "Review Moderated", description: "Review content has been successfully updated.", type: "success" });
        router.push("/dashboard/reviews");
      } else {
        toast({ title: "Error", description: "Could not save moderated review.", type: "error" });
      }
    } catch (err: any) {
      setLoading(false);
      toast({ title: "Error Moderating Review", description: err.message || "An unexpected error occurred.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/reviews">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer border-border text-primary hover:bg-accent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Moderate User Review</h1>
          <p className="text-xs text-muted-foreground font-medium">Edit rating score and verify commentary content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-accent/30 rounded-t-lg">
            <CardTitle className="text-base font-bold text-primary flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary/60" />
              <span>Review Details</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Moderate stars rating and comment values submitted by application user.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Context Info blocks */}
            <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-lg border border-border bg-accent/20">
              {/* Reviewer Details */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
                  <AvatarImage src={reviewer.avatar} alt={reviewer.name} />
                  <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                    {reviewer.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Submitted By</span>
                  <span className="text-sm font-bold text-primary">{reviewer.name}</span>
                </div>
              </div>

              {/* Landmark Details */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Heritage Site</span>
                  <span className="text-sm font-bold text-primary">{placeName}</span>
                </div>
              </div>
            </div>

            {/* Interactive Stars selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">Review Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-border fill-border"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-muted-foreground">{rating} / 5</span>
              </div>
            </div>

            {/* Commentary Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                User Comment <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className={`border-border bg-background resize-y focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm ${
                  errors.comment ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                placeholder="User comment text..."
              />
              {errors.comment && <p className="text-[10px] text-destructive font-semibold">{errors.comment}</p>}
            </div>
          </CardContent>

          <CardFooter className="border-t border-border px-6 py-4 flex items-center justify-end gap-3 bg-accent/20 rounded-b-lg">
            <Link href="/dashboard/reviews">
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
                  <span>Saving Review...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Moderated Review</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}