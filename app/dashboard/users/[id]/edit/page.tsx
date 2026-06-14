import { cookies } from "next/headers";
import UserEditForm from "@/components/dashboard/UserEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);

  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialUser = null;

  try {
    const res = await fetch(`http://localhost:4000/api/users/${userId}`, { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      initialUser = json.success ? json.data : null;
    }
  } catch (err) {
    console.error(`Failed to fetch user ${userId} in Server Component:`, err);
  }

  return (
    <UserEditForm
      userId={userId}
      initialUser={initialUser}
    />
  );
}
