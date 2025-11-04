/**
 * Composant skeleton pour le chargement des cartes
 * Améliore l'expérience utilisateur pendant le chargement
 */

export function MapSkeleton() {
  return (
    <div className="w-full h-[600px] rounded-lg bg-muted/20 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">
          Chargement de la carte...
        </p>
      </div>
    </div>
  );
}

/**
 * Version mini pour les cartes de détail d'événement
 */
export function MiniMapSkeleton() {
  return (
    <div className="w-full h-[300px] rounded-lg bg-muted/20 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="mx-auto w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
