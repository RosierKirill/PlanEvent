"use client"

import { ChevronRight, Sparkles, Users, Heart, Dumbbell, Plane, Briefcase, Cpu, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const categories = [
  { icon: Sparkles, label: "Tous les groupes" },
  { icon: Users, label: "Nouveaux groupes" },
  { icon: Heart, label: "Activités sociales" },
  { icon: Heart, label: "Hobbies et passions" },
  { icon: Dumbbell, label: "Sports et fitness" },
  { icon: Plane, label: "Voyages et plein air" },
  { icon: Briefcase, label: "Entreprise et carrière" },
  { icon: Cpu, label: "Technologie" },
  { icon: Home, label: "Communauté" },
]

export function CategoryFilter() {
  return (
    <div className="mb-8">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Button
                key={index}
                variant="ghost"
                className="flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">{category.label}</span>
              </Button>
            )
          })}
          <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <ChevronRight className="h-5 w-5 text-primary-foreground" />
            </div>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
