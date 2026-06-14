"use client";

import React from "react";
import Link from "next/link";
import { useDB, Place, Category, User, Review, PlacePhoto } from "@/lib/context";
import {
  Landmark,
  Tags,
  Users,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OverviewDashboardProps {
  initialPlaces: Place[];
  initialCategories: Category[];
  initialUsers: User[];
  initialReviews: Review[];
  initialPlacePhotos: PlacePhoto[];
}

export default function OverviewDashboard({
  initialPlaces,
  initialCategories,
  initialUsers,
  initialReviews,
  initialPlacePhotos
}: OverviewDashboardProps) {
  const {
    places: contextPlaces,
    categories: contextCategories,
    users: contextUsers,
    reviews: contextReviews,
    placePhotos: contextPhotos
  } = useDB();

  const places = contextPlaces.length > 0 ? contextPlaces : initialPlaces;
  const categories = contextCategories.length > 0 ? contextCategories : initialCategories;
  const users = contextUsers.length > 0 ? contextUsers : initialUsers;
  const reviews = contextReviews.length > 0 ? contextReviews : initialReviews;
  const placePhotos = contextPhotos.length > 0 ? contextPhotos : initialPlacePhotos;

  // Sort and slice lists for recent items
  const recentPlaces = [...places]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Helper to find category name
  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  // Helper to find primary photo for a place
  const getPrimaryPhoto = (placeId: number) => {
    const photo = placePhotos.find((p) => p.place_id === placeId && p.is_primary);
    return photo ? photo.photo_url : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=60";
  };

  // Helper to find user details
  const getUserDetails = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user
      ? { name: user.name, avatar: user.avatar_url, role: user.role }
      : { name: "Anonymous User", avatar: "", role: "user" };
  };

  // Helper to find place name
  const getPlaceName = (placeId: number) => {
    const pl = places.find((p) => p.id === placeId);
    return pl ? pl.name : "Deleted Place";
  };

  // Chart data calculations: places count per category
  const categoryChartData = categories.map((cat) => {
    const count = places.filter((p) => p.category_id === cat.id).length;
    return { name: cat.name, count };
  });
  const maxCount = Math.max(...categoryChartData.map((d) => d.count), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Overview Dashboard</h1>
        <p className="text-sm text-zinc-500 font-medium">
          Real-time analytics and content management overview.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Places */}
        <Card className="bg-white border-zinc-200 shadow-2xs hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Places</CardTitle>
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 border border-zinc-150">
              <Landmark className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">{places.length}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Heritage locations catalogued</p>
          </CardContent>
        </Card>

        {/* Total Categories */}
        <Card className="bg-white border-zinc-200 shadow-2xs hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Categories</CardTitle>
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 border border-zinc-150">
              <Tags className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">{categories.length}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Place categories defined</p>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="bg-white border-zinc-200 shadow-2xs hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Reviews</CardTitle>
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 border border-zinc-150">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">{reviews.length}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Submitted mobile reviews</p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="bg-white border-zinc-200 shadow-2xs hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Registered Users</CardTitle>
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 border border-zinc-150">
              <Users className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">{users.length}</div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Mobile application users</p>
          </CardContent>
        </Card>
      </div>

      {/* Category distribution visual chart */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>Places by Category</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Distribution of heritage sites across registered categories.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            {categoryChartData.map((data) => {
              const percent = Math.max((data.count / maxCount) * 100, 3); // minimum 3% for visibility
              return (
                <div key={data.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700">{data.name}</span>
                    <span className="font-bold text-zinc-950 bg-zinc-100 px-1.5 py-0.5 rounded-sm">{data.count} places</span>
                  </div>
                  <div className="h-3.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 p-0.5">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick review moderation overview */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Recent Reviews</span>
            </CardTitle>
            <Link href="/dashboard/reviews" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 font-semibold">
              <span>Moderate All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardDescription className="text-xs">
            Latest comments and ratings submitted by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => {
                const user = getUserDetails(review.user_id);
                return (
                  <div key={review.id} className="flex gap-3 text-xs border-b border-zinc-100 pb-3 last:border-0 pb-3">
                    <Avatar className="h-8 w-8 border border-zinc-200 shrink-0 mt-0.5">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-[9px] font-bold">
                        {user.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-zinc-900 truncate">{user.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                          {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-zinc-500 truncate">
                        on <span className="text-zinc-800 font-bold">{getPlaceName(review.place_id)}</span>
                      </p>
                      <div className="flex items-center gap-0.5 text-amber-500 py-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "fill-amber-500" : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-zinc-650 line-clamp-2 leading-relaxed italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-400 text-xs">No reviews submitted yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Places Table */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Landmark className="h-4 w-4" />
              <span>Recently Catalogued Places</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Review and manage the latest places added to Surabaya Heritage database.
            </CardDescription>
          </div>
          <Link href="/dashboard/places">
            <Button variant="outline" size="sm" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <span>View All Places</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Image</th>
                  <th className="pb-3 font-semibold">Place Name</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Avg Rating</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date Added</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPlaces.length > 0 ? (
                  recentPlaces.map((place) => (
                    <tr key={place.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <img
                          src={getPrimaryPhoto(place.id)}
                          alt={place.name}
                          className="w-10 h-10 object-cover rounded-md border border-zinc-200 shadow-3xs"
                        />
                      </td>
                      <td className="py-3 pr-4 font-bold text-zinc-950">
                        {place.name}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 font-medium">
                        {getCategoryName(place.category_id)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-zinc-900">{place.avg_rating || "New"}</span>
                          {place.review_count > 0 && (
                            <span className="text-[10px] text-zinc-400 font-medium">({place.review_count})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
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
                      <td className="py-3 pr-4 text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(place.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/dashboard/places/${place.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold cursor-pointer">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-zinc-400">
                      No places catalogued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
