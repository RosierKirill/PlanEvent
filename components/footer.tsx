import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/Logo-Icon.svg"
                alt="Plan'Event Logo"
                width={24}
                height={25}
                style={{ width: "24px", height: "25px" }}
              />
              <h3 className="text-lg font-bold text-foreground">
                Plan&apos;Event
              </h3>{" "}
            </div>

            <p className="text-sm text-muted-foreground">
              Organisez vos événements et rejoignez des groupes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Groupes
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Événements
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Fonctionnalités
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Gestion d&apos;événements</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Coordination de groupe</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Carte interactive</span>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Découvrez les événements près de chez vous
            </h4>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Plan&apos;Event. Tous droits
              réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Conditions
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
