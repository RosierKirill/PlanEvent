import { cn } from "@/lib/utils";

export const reviews = [
  {
    name: "Sophie Martin",
    username: "@sophiemartin",
    body: "Génial pour organiser nos sorties entre amis ! J'ai trouvé un groupe pour le festival de jazz à Lyon en 2 minutes.",
    img: "https://avatar.vercel.sh/sophie",
  },
  {
    name: "Thomas Dubois",
    username: "@thomasdubois",
    body: "Enfin une appli qui facilite l'organisation d'événements. Le chat intégré est super pratique pour coordonner tout le monde.",
    img: "https://avatar.vercel.sh/thomas",
  },
  {
    name: "Marie Lefebvre",
    username: "@marielefebvre",
    body: "J'ai découvert plein d'événements sympas près de chez moi. L'interface est intuitive et facile à utiliser.",
    img: "https://avatar.vercel.sh/marie",
  },
  {
    name: "Lucas Bernard",
    username: "@lucasbernard",
    body: "Parfait pour créer des groupes pour les concerts ! J'ai rencontré de nouvelles personnes qui partagent les mêmes goûts musicaux.",
    img: "https://avatar.vercel.sh/lucas",
  },
  {
    name: "Emma Petit",
    username: "@emmapetit",
    body: "Super pratique pour réserver des salles pour nos soirées étudiantes. Tout est centralisé au même endroit.",
    img: "https://avatar.vercel.sh/emma",
  },
  {
    name: "Antoine Rousseau",
    username: "@antoinerousseau",
    body: "L'organisation en groupe n'a jamais été aussi simple !",
    img: "https://avatar.vercel.sh/antoine",
  },
  {
    name: "Chloé Moreau",
    username: "@chloemoreau",
    body: "J'adore la variété d'événements proposés. De la musique aux festivals, il y en a pour tous les goûts !",
    img: "https://avatar.vercel.sh/chloe",
  },
  {
    name: "Hugo Laurent",
    username: "@hugolaurent",
    body: "Application parfaite pour planifier nos sorties de groupe. Plus besoin de jongler entre 10 apps différentes.",
    img: "https://avatar.vercel.sh/hugo",
  },
];

export const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/10 bg-gray-950/1 hover:bg-gray-950/5",
        // dark styles
        "dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/15"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};
