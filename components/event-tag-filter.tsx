"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  function checkScrollability() {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }
  }

  function scrollLeft() {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
        setTimeout(checkScrollability, 100);
      }
    }
  }

  function scrollRight() {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
        setTimeout(checkScrollability, 100);
      }
    }
  }

  useEffect(() => {
    checkScrollability();
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, []);

  return (
    <div className="mb-4 relative flex items-center">
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          className="absolute left-0 top-[20px] h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background z-10 "
          aria-label="Défiler vers la gauche"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      <ScrollArea className="w-full whitespace-nowrap" ref={scrollAreaRef}>
        <div className="flex gap-4 pb-4 px-2">
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

      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          className="absolute right-0 top-[20px] h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background z-10"
          aria-label="Défiler vers la droite"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
