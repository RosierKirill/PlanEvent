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
  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1 gap-24 flex flex-col">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-8 text-center pb-4 pt-12 md:pt-20">
          <SparklesText>
            Organiser vos groupes pour{" "}
            <AuroraText>vos événements favoris</AuroraText>
          </SparklesText>
        </h1>

        {/* Event Section */}
        <div>
          <React.Suspense fallback={<div>Chargement des événements...</div>}>
            <h2 className="text-2xl font-bold mb-4">Événements à venir</h2>
            <EventsList limit={6} />
          </React.Suspense>
        </div>

        {/* Features Section */}
        <FeaturesSection />

        {/* Marquee Section */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="py-4">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="py-4">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>

          {/* Gradient fades on sides */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent"></div>
        </div>

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
