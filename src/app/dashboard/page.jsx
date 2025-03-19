"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else if (session.user.role === "admin") {
      router.push("/admin/dashboard");
    } else if (session.user.role === "vendor") {
      router.push("/vendor/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Welcome, {session?.user?.name}!</p>
        <p>Your role is: {session?.user?.role}</p>
      </div>
    </div>
  );
}

