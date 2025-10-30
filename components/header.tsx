"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {Sun } from "lucide-react"
import { Globe } from "lucide-react"
import Image from "next/image"

export function Header() {
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
              <Sun className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
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
