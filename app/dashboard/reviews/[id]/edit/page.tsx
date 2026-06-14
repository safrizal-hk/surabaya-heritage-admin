import { cookies } from "next/headers";
import ReviewEditForm from "@/components/dashboard/ReviewEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const reviewId = parseInt(resolvedParams.id);

  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialReview = null;
  let initialPlaces = [];
  let initialUsers = [];

  try {
    const [reviewRes, placesRes, usersRes] = await Promise.all([
      fetch(`http://localhost:4000/api/reviews/${reviewId}`, { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/places?all=true", { headers, cache: "no-store" }),
      fetch("http://localhost:4000/api/users", { headers, cache: "no-store" })
    ]);

    if (reviewRes.ok) {
      const json = await reviewRes.json();
      initialReview = json.success ? json.data : null;
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
    console.error(`Failed to fetch review ${reviewId} details in Server Component:`, err);
  }

  return (
    <ReviewEditForm
      reviewId={reviewId}
      initialReview={initialReview}
      initialPlaces={initialPlaces}
      initialUsers={initialUsers}
    />
  );
}
