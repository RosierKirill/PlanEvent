"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          <Link href="/events">
            <Button
              variant="ghost"
              className={`gap-2 rounded-none border-b-2 ${
                pathname === "/events"
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
                pathname === "/rooms"
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
