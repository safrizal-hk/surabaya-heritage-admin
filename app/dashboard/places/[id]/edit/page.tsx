import { cookies } from "next/headers";
import PlaceEditForm from "@/components/dashboard/PlaceEditForm";
import { API_URL } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlacePage({ params }: PageProps) {
  const resolvedParams = await params;
  const placeId = parseInt(resolvedParams.id);

  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialPlace = null;
  let initialCategories = [];
  let initialPlacePhotos = [];

  try {
    const [placeRes, catsRes, photosRes] = await Promise.all([
      fetch(`${API_URL}/places/${placeId}`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/categories?all=true`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/places/photos/all`, { headers, cache: "no-store" })
    ]);

    if (placeRes.ok) {
      const json = await placeRes.json();
      initialPlace = json.success ? json.data : null;
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
    console.error(`Failed to fetch place ${placeId} details in Server Component:`, err);
  }

  return (
    <PlaceEditForm
      placeId={placeId}
      initialPlace={initialPlace}
      initialCategories={initialCategories}
      initialPlacePhotos={initialPlacePhotos}
    />
  );
}
