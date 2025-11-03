"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isEvents = pathname?.startsWith("/events");
  const isRooms = pathname?.startsWith("/rooms");

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          <Link href="/">
            <Button
              variant="ghost"
              className={`gap-2 rounded-none border-b-2 ${
                isHome
                  ? "border-primary"
                  : "border-transparent hover:border-primary"
              }`}
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link href="/events">
            <Button
              variant="ghost"
              className={`gap-2 rounded-none border-b-2 ${
                isEvents
                  ? "border-primary"
                  : "border-transparent hover:border-primary"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Événements
            </Button>
          </Link>
          <Link href="/rooms">
            <Button
              variant="ghost"
              className={`gap-2 rounded-none border-b-2 ${
                isRooms
                  ? "border-primary"
                  : "border-transparent hover:border-primary"
              }`}
            >
              <Users className="h-4 w-4" />
              Salles
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
