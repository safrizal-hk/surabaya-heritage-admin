import { cookies } from "next/headers";
import UsersTable from "@/components/dashboard/UsersTable";

export default async function UsersListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sh_jwt_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let initialUsers = [];

  try {
    const usersRes = await fetch("http://localhost:4000/api/users", { headers, cache: "no-store" });
    if (usersRes.ok) {
      const json = await usersRes.json();
      initialUsers = json.success ? json.data : [];
    }
  } catch (err) {
    console.error("Failed to fetch users list in Server Component:", err);
  }

  return <UsersTable initialUsers={initialUsers} />;
}
