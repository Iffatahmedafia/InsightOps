"use client";

import { useEffect, useState } from "react";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppLayout({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("insightops-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("insightops-theme", nextDark ? "dark" : "light");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-5 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0a0a0a_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-7xl flex-col gap-5">
        <Navbar dark={dark} onToggleTheme={toggleTheme} />
        <main className="flex flex-1 flex-col gap-5">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
