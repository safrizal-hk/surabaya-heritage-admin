"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Star,
  User as UserIcon,
  Landmark
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditReviewPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const reviewId = parseInt(resolvedParams.id);

  const { reviews, places, users, updateReview } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  // Find target review
  const review = reviews.find((r) => r.id === reviewId);

  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill details
  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [review]);

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <MessageSquare className="h-12 w-12 text-zinc-300" />
        <h2 className="text-xl font-bold text-zinc-900">Review Not Found</h2>
        <p className="text-sm text-zinc-500 font-medium">The review you are looking to moderate does not exist or has been deleted.</p>
        <Link href="/dashboard/reviews">
          <Button variant="outline" size="sm">
            Back to Reviews
          </Button>
        </Link>
      </div>
    );
  }

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

  const reviewer = getUserDetails(review.user_id);
  const placeName = getPlaceName(review.place_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!comment.trim()) newErrors.comment = "Review comment is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      const updated = updateReview(reviewId, rating, comment.trim());
      setLoading(false);

      if (updated) {
        toast({
          title: "Review Moderated",
          description: "Review content has been successfully updated.",
          type: "success",
        });
        router.push("/dashboard/reviews");
      } else {
        toast({
          title: "Error",
          description: "Could not save moderated review.",
          type: "error",
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/reviews">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Moderate User Review</h1>
          <p className="text-xs text-zinc-500 font-medium">Edit user rating score and verify or moderate commentary content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-zinc-400" />
              <span>Review Details</span>
            </CardTitle>
            <CardDescription className="text-xs">Moderate stars rating and comment values submitted by application user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Context Info blocks */}
            <div className="grid gap-4 sm:grid-cols-2 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30">
              {/* Reviewer Details */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-200 shrink-0">
                  <AvatarImage src={reviewer.avatar} alt={reviewer.name} />
                  <AvatarFallback className="text-xs font-bold">
                    {reviewer.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Submitted By</span>
                  <span className="text-xs font-bold text-zinc-850">{reviewer.name}</span>
                </div>
              </div>

              {/* Landmark Details */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shrink-0">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Heritage Site</span>
                  <span className="text-xs font-bold text-zinc-850">{placeName}</span>
                </div>
              </div>
            </div>

            {/* Interactive Stars selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Review Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= rating ? "fill-amber-500" : "text-zinc-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Commentary Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">User Comment <span className="text-destructive">*</span></label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className={`border-zinc-200 resize-y focus-visible:ring-1 ${errors.comment ? "border-destructive focus-visible:ring-destructive" : ""}`}
                placeholder="User comment text..."
              />
              {errors.comment && <p className="text-[10px] text-destructive font-semibold">{errors.comment}</p>}
            </div>
          </CardContent>

          {/* Form actions footer */}
          <CardFooter className="border-t border-zinc-100 p-6 flex items-center justify-end gap-3 bg-zinc-50/30">
            <Link href="/dashboard/reviews">
              <Button type="button" variant="outline" className="h-9.5 text-xs cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
