import * as React from "react"
import { CategoryFilter } from "@/components/category-filter"
import { GroupGrid } from "@/components/group-grid"

export default function GroupsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Groupes</h1>
      <React.Suspense fallback={<div>Chargement des catégories...</div>}>
        <CategoryFilter />
      </React.Suspense>
      <React.Suspense fallback={<div>Chargement des groupes...</div>}>
        <GroupGrid />
      </React.Suspense>
    </main>
  )
}