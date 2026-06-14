import { cookies } from "next/headers";
import PlacesTable from "@/components/dashboard/PlacesTable";

export default async function PlacesListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialPlaces = [];
  let initialCategories = [];
  let initialPlacePhotos = [];

  try {
    const [placesRes, catsRes, photosRes] = await Promise.all([
      fetch("http://localhost:4000/api/places?all=true", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/categories?all=true", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/places/photos/all", { headers, cache: "no-store" })
    ]);

    if (placesRes.ok) {
      const json = await placesRes.json();
      initialPlaces = json.success ? json.data : [];
    }
    if (catsRes.ok) {
      const json = await catsRes.json();
      initialCategories = json.success ? json.data : [];
    }
    if (photosRes.ok) {
      const json = await photosRes.json();
      initialPlacePhotos = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch places/categories/photos in Server Component:", err);
  }

  return (
    <PlacesTable
      initialPlaces={initialPlaces}
      initialCategories={initialCategories}
      initialPlacePhotos={initialPlacePhotos}
    />
  );
}
