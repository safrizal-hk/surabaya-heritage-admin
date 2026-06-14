import { cookies } from "next/headers";
import CategoriesTable from "@/components/dashboard/CategoriesTable";

export default async function CategoriesListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialCategories = [];
  let initialPlaces = [];

  try {
    const [catsRes, placesRes] = await Promise.all([
      fetch("http://localhost:4000/api/categories?all=true", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/places?all=true", { headers, cache: "no-store" }),
    ]);

    if (catsRes.ok) {
      const json = await catsRes.json();
      initialCategories = json.success ? json.data : [];
    }
    if (placesRes.ok) {
      const json = await placesRes.json();
      initialPlaces = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch categories/places in Server Component:", err);
  }

  return (
    <CategoriesTable
      initialCategories={initialCategories}
      initialPlaces={initialPlaces}
    />
  );
}
