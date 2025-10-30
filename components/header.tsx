"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {Sun } from "lucide-react"
import { Globe } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Plan'Event</span>
          </div>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Input type="text" placeholder="Faites une recherche!" className="pr-20" />
              <Button variant="ghost" size="icon" className="absolute right-8 top-0 h-full">
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" className="absolute right-0 top-0 h-full rounded-full bg-primary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
              const root = document.documentElement;
              const isDark = root.classList.toggle("dark");
              try {
                localStorage.setItem("theme", isDark ? "dark" : "light");
              } catch (e) {
                /* ignore storage errors */
              }
              }}
              title="Basculer thème clair / sombre"
            >
              <Sun className="h-4 w-4" /> Clair
            </Button>
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" /> Français
            </Button>
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground">
              S'inscrire
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
