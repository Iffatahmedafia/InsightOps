"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, FileText, LayoutDashboard, LogOut, Moon, Server, SunMedium } from "lucide-react";

import { supabase } from "../lib/supabaseClient";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard#applications", label: "Applications", icon: Server },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/logs", label: "Logs", icon: FileText },
];

export function Navbar({ dark, onToggleTheme }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="rounded-lg border border-slate-200 bg-white/88 px-4 py-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-glow">
            <Activity size={20} />
          </span>
          <div>
            <strong className="block text-sm font-semibold text-slate-950 dark:text-white">InsightOps</strong>
            <span className="text-xs text-slate-500 dark:text-slate-400">Reliability platform</span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {user &&
            navItems.map((item) => {
              const Icon = item.icon;
              const basePath = item.href.split("#")[0];
              const active = pathname === basePath;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}

          {!user && (
            <>
              <Link href="/login" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
                Sign in
              </Link>
              <Link href="/register" className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Register
              </Link>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <LogOut size={15} />
              Logout
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {dark ? <SunMedium size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
