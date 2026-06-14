import { cookies } from "next/headers";
import ReviewsTable from "@/components/dashboard/ReviewsTable";

export default async function ReviewsListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialReviews = [];
  let initialPlaces = [];
  let initialUsers = [];

  try {
    const [reviewsRes, placesRes, usersRes] = await Promise.all([
      fetch("http://localhost:4000/api/reviews", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/places?all=true", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/users", { headers, cache: "no-store" })
    ]);

    if (reviewsRes.ok) {
      const json = await reviewsRes.json();
      initialReviews = json.success ? json.data : [];
    }
    if (placesRes.ok) {
      const json = await placesRes.json();
      initialPlaces = json.success ? json.data : [];
    }
    if (usersRes.ok) {
      const json = await usersRes.json();
      initialUsers = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch reviews/places/users in Server Component:", err);
  }

  return (
    <ReviewsTable
      initialReviews={initialReviews}
      initialPlaces={initialPlaces}
      initialUsers={initialUsers}
    />
  );
}
