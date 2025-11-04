"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Moon, Search, Sun, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [scope, setScope] = React.useState<"rooms" | "events">("rooms");
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Check initial auth state
    const checkAuth = () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        setIsAuthed(!!token);
      } catch {}
    };

    checkAuth();

    // Listen for auth changes in same tab (custom event)
    const handleAuthChange = () => checkAuth();

    // Listen for auth changes in other tabs (storage event)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuth();
      }
    };

    window.addEventListener("auth-state-changed", handleAuthChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/Logo-Icon.svg"
              alt="Plan'Event Logo"
              width={24}
              height={24}
            />
            <span className="text-xl font-bold">Plan'Event</span>
          </div>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-2xl items-center">
            <div className="flex items-center gap-2">
              <select
                aria-label="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as "rooms" | "events")}
                className="rounded-l-md border border-r-0 px-2 py-1 bg-background text-sm h-9"
              >
                <option value="rooms">Groupes</option>
                <option value="events">Événements</option>
              </select>
            </div>

            <div className="relative flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const encoded = encodeURIComponent(query.trim());
                  const path = scope === "events" ? "/events" : "/rooms";
                  router.push(encoded ? `${path}?q=${encoded}` : path);
                }}
              >
                <Input
                  value={query}
                  onChange={(e) =>
                    setQuery((e.target as HTMLInputElement).value)
                  }
                  type="text"
                  placeholder="Rechercher événements ou groupes..."
                  className="pr-28 rounded-l-none shadow-none"
                />

                <button
                  type="button"
                  aria-label="clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center z-10 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  aria-label="submit search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1.5 flex items-center z-20"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title="Basculer thème clair / sombre"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
            </Button>
            {isAuthed ? (
              <Link href="/users/me" aria-label="Profil">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                {/* Link to login page */}
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
