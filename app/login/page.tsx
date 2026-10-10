"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import LoginView from "@/app/components/LoginView";

export default function LoginPage() {
  const { employee, loading } = useAuth();
  const router = useRouter();

  // If already authenticated, forward to home screen
  useEffect(() => {
    if (!loading && employee) {
      router.replace("/");
    }
  }, [employee, loading, router]);

  return <LoginView />;
}
