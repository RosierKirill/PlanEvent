"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MagneticButton } from "./ui/magnetic-button";

export function CTASection() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsConnected(!!token);
  }, []);

  return (
    <Card className="p-12 text-center bg-linear-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Rejoignez la communauté</span>
        </div>

        <h2 className="text-4xl font-bold">
          Prêt à rejoindre un groupe pour votre prochain événement ?
        </h2>

        <p className="text-lg text-muted-foreground">
          {isConnected
            ? "Découvrez tous les événements disponibles et rejoignez la communauté."
            : "Inscrivez-vous gratuitement et commencez à créer vos groupes, découvrir des événements en quelques clics."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <MagneticButton
            size="sm"
            className="text-lg p-5 px-6! group"
            onClick={() => router.push(isConnected ? "/events" : "/register")}
          >
            {isConnected ? "Voir les événements" : "Créer un compte"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </div>
      </div>
    </Card>
  );
}
