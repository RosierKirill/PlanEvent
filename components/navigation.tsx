import { Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          <Button variant="ghost" className="gap-2 rounded-none border-b-2 border-transparent hover:border-primary">
            <Calendar className="h-4 w-4" />
            Événements
          </Button>
          <Button variant="ghost" className="gap-2 rounded-none border-b-2 border-primary">
            <Users className="h-4 w-4" />
            Groupes
          </Button>
        </div>
      </div>
    </nav>
  )
}
