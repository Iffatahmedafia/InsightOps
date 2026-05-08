"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "./supabaseClient";

export function useAuth({ redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user || null);
      setLoading(false);

      if (!data.user && redirectTo) {
        router.replace(redirectTo);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (!session?.user && redirectTo) {
        router.replace(redirectTo);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [redirectTo, router]);

  return { loading, user };
}
