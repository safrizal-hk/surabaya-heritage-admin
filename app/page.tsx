"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDB } from "@/lib/context";

export default function Home() {
  const { isAuthenticated } = useDB();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-zinc-50">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-500 font-medium animate-pulse">Routing to dashboard...</p>
      </div>
    </div>
  );
}
