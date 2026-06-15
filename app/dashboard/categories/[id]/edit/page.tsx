import { cookies } from "next/headers";
import CategoryEditForm from "@/components/dashboard/CategoryEditForm";
import { API_URL } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoryId = parseInt(resolvedParams.id);

  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialCategory = null;

  try {
    const res = await fetch(`${API_URL}/categories/${categoryId}`, { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      initialCategory = json.success ? json.data : null;
    }
  } catch (err) {
    console.error(`Failed to fetch category ${categoryId} in Server Component:`, err);
  }

  return (
    <CategoryEditForm
      categoryId={categoryId}
      initialCategory={initialCategory}
    />
  );
}
