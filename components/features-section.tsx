import { Card } from "@/components/ui/card";
import { Calendar, MapPin, MessageSquareText, Users } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Événements variés",
    description:
      "Découvrez une multitude d'événements : concerts, festivals, soirées et bien plus encore.",
  },
  {
    icon: Users,
    title: "Créez vos groupes",
    description:
      "Organisez facilement vos sorties en créant des groupes avec vos amis.",
  },
  {
    icon: MapPin,
    title: "Rejoignez des groupes",
    description:
      "Réservez des espaces adaptés à vos événements partout en France.",
  },
  {
    icon: MessageSquareText,
    title: "Discutez pour planifier",
    description:
      "Utilisez notre chat intégré pour coordonner les détails avec les membres de votre groupe.",
  },
];

export function FeaturesSection() {
  return (
    <div className="mb-4">
      <h2 className="text-3xl font-bold text-center mb-4">
        Tout ce dont vous avez besoin pour vos événements
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Plan'Event simplifie l'organisation de vos sorties et vous aide à
        découvrir de nouveaux événements près de chez vous.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
