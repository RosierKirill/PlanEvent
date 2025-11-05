"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Menu, Search, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { BounceButton } from "./ui/bounce-button";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [scope, setScope] = React.useState<"rooms" | "events">("rooms");
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/Logo-Icon.svg"
              alt="Plan'Event Logo"
              width={30}
              height={30}
            />
            <span className="text-xl font-bold hidden sm:inline">
              Plan'Event
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center">
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

                <BounceButton
                  type="submit"
                  aria-label="submit search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1.5 flex items-center z-20"
                >
                  <Search className="h-4 w-4 text-white" />
                </BounceButton>
              </form>
            </div>
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <AnimatedThemeToggler className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" />
            <Button variant="ghost" size="sm" className="h-9">
              <Globe className="h-4 w-4" />
            </Button>
            {isAuthed ? (
              <Link href="/users/me" aria-label="Profil">
                <Button variant="ghost" size="sm" className="h-9">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground h-9"
                  >
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t pt-4">
            {/* Mobile Search */}
            <div className="flex flex-col gap-2">
              <select
                aria-label="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as "rooms" | "events")}
                className="rounded-md border px-3 py-2 bg-background text-sm"
              >
                <option value="rooms">Groupes</option>
                <option value="events">Événements</option>
              </select>

              <div className="relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const encoded = encodeURIComponent(query.trim());
                    const path = scope === "events" ? "/events" : "/rooms";
                    router.push(encoded ? `${path}?q=${encoded}` : path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Input
                    value={query}
                    onChange={(e) =>
                      setQuery((e.target as HTMLInputElement).value)
                    }
                    type="text"
                    placeholder="Rechercher..."
                    className="pr-20"
                  />

                  {query && (
                    <button
                      type="button"
                      aria-label="clear search"
                      onClick={() => setQuery("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <BounceButton
                    type="submit"
                    aria-label="submit search"
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1.5 flex items-center z-20"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </BounceButton>
                </form>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-2">
              <AnimatedThemeToggler className="flex h-8 items-center justify-start gap-3 px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md w-full">
                <span className="text-sm">Thème</span>
              </AnimatedThemeToggler>

              <Button variant="ghost" className="justify-start" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Langue
              </Button>

              {isAuthed ? (
                <Link href="/users/me" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Se connecter
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      size="sm"
                      className="w-full bg-primary text-primary-foreground"
                    >
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
