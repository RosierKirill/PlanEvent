export const TAG_IMAGE_MAP: Record<string, string> = {
  concert: "/concert.jpg",
  sport: "/sport.jpg",
  art: "/art&culture.jpg",
  conference: "/conference.jpg",
  soiree: "/party.jpg",
  communautaire: "/community.jpg",
  festival: "/festival.jpg",
  etudiant: "/student.jpg",
  convention: "/convention.jpg",
  autre: "/other.jpg",
};

export function getImageForTags(tags?: unknown): string | null {
  if (!Array.isArray(tags)) return null;
  for (const raw of tags) {
    const tag = String(raw).toLowerCase().trim();
    if (TAG_IMAGE_MAP[tag]) return TAG_IMAGE_MAP[tag];
  }
  return "/other.jpg";
}

