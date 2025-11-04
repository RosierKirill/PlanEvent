import { CTASection } from "@/components/cta-section";
import EventsList from "@/components/events-list";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { ReviewCard, reviews } from "@/components/reviews";
import { AuroraText } from "@/components/ui/aurora-text";
import { Marquee } from "@/components/ui/marquee";
import { SparklesText } from "@/components/ui/sparkles-text";
import * as React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1 gap-20 flex flex-col">
        <h1 className="text-l font-bold mb-8 text-center pb-4 pt-20">
          <SparklesText>
            Organiser vos groupes pour{" "}
            <AuroraText>vos événements favoris</AuroraText>
          </SparklesText>
        </h1>

        {/* Event Section */}
        <div>
          <React.Suspense fallback={<div>Chargement des événements...</div>}>
            <h2 className="text-2xl font-bold mb-4">Événements à venir</h2>
            <EventsList />
          </React.Suspense>
        </div>

        {/* Features Section */}
        <FeaturesSection />

        {/* Marquee Section */}
        <div className="mb-4 rounded-lg border border-border bg-card/50 overflow-hidden">
          <Marquee pauseOnHover className="py-4">
            {reviews.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
        </div>

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
