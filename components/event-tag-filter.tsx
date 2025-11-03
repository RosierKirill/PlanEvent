"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  GraduationCap,
  Heart,
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Trophy,
  Users,
  Utensils,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

const EVENT_TYPES = [
  { id: "concert", label: "Concert", icon: Music },
  { id: "sport", label: "Sport", icon: Trophy },
  { id: "art", label: "Art & Culture", icon: Palette },
  { id: "conference", label: "Conférence", icon: GraduationCap },
  { id: "soiree", label: "Soirée", icon: PartyPopper },
  { id: "communautaire", label: "Communautaire", icon: Users },
  { id: "festival", label: "Festival", icon: Trophy },
  { id: "etudiant", label: "Étudiant", icon: GraduationCap },
  { id: "convention", label: "Convention", icon: Users },
  { id: "autre", label: "Autre", icon: Sparkles },
];

export function EventTagFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams?.get("tag");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function onSelect(tagId?: string) {
    const params = new URLSearchParams(Array.from(searchParams || []));
    if (!tagId) {
      params.delete("tag");
    } else {
      params.set("tag", tagId);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function scrollRight() {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
      }
    }
  }

  return (
    <div className="mb-8">
      <ScrollArea className="w-full whitespace-nowrap" ref={scrollAreaRef}>
        <div className="flex gap-4 pb-4">
          <Button
            variant="ghost"
            onClick={() => onSelect(undefined)}
            className={`flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] transition-all ${
              !activeTag
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-secondary/50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                !activeTag ? "bg-primary-foreground/20" : "bg-secondary"
              }`}
            >
              <Sparkles
                className={`h-5 w-5 ${
                  !activeTag ? "text-primary-foreground" : ""
                }`}
              />
            </div>
            <span className="text-xs text-center font-medium">Tous</span>
          </Button>

          {EVENT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = activeTag === t.id;
            return (
              <Button
                key={t.id}
                variant="ghost"
                onClick={() => onSelect(t.id)}
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isActive ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-primary-foreground" : ""
                    }`}
                  />
                </div>
                <span className="text-xs text-center font-medium">
                  {t.label}
                </span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollRight}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-10"
        aria-label="Défiler vers la droite"
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    </div>
  );
}
