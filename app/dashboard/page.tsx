import { cookies } from "next/headers";
import OverviewDashboard from "@/components/dashboard/OverviewDashboard";
import { API_URL } from "@/lib/api";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialPlaces = [];
  let initialCategories = [];
  let initialUsers = [];
  let initialReviews = [];
  let initialPlacePhotos = [];

  try {
    const [placesRes, catsRes, usersRes, reviewsRes, photosRes] = await Promise.all([
      fetch(`${API_URL}/places?all=true`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/categories?all=true`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/users`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/reviews`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/places/photos/all`, { headers, cache: "no-store" })
    ]);

    if (placesRes.ok) {
      const json = await placesRes.json();
      initialPlaces = json.success ? json.data : [];
    }
    if (catsRes.ok) {
      const json = await catsRes.json();
      initialCategories = json.success ? json.data : [];
    }
    if (usersRes.ok) {
      const json = await usersRes.json();
      initialUsers = json.success ? json.data : [];
    }
    if (reviewsRes.ok) {
      const json = await reviewsRes.json();
      initialReviews = json.success ? json.data : [];
    }
    if (photosRes.ok) {
      const json = await photosRes.json();
      initialPlacePhotos = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch dashboard data in Server Component:", err);
  }

  return (
    <OverviewDashboard
      initialPlaces={initialPlaces}
      initialCategories={initialCategories}
      initialUsers={initialUsers}
      initialReviews={initialReviews}
      initialPlacePhotos={initialPlacePhotos}
    />
  );
}
