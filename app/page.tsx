import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CategoryFilter } from "@/components/category-filter"
import { GroupGrid } from "@/components/group-grid"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Groupes Musique à proximité de Lyon, FR</h1>
        <CategoryFilter />
        <GroupGrid />
      </main>
    </div>
  )
}
