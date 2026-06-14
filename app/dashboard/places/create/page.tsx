import { cookies } from "next/headers";
import PlaceCreateForm from "@/components/dashboard/PlaceCreateForm";

export default async function CreatePlacePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialCategories = [];

  try {
    const res = await fetch("http://localhost:4000/api/categories?all=true", { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      initialCategories = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch categories list in Server Component:", err);
  }

  return <PlaceCreateForm initialCategories={initialCategories} />;
}
