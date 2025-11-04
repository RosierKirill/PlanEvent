"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

/**
 * Composant pour ajuster automatiquement les bounds de la carte
 * afin d'afficher tous les marqueurs
 */
interface MapBoundsAdjusterProps {
  positions: LatLngExpression[];
}

export function MapBoundsAdjuster({ positions }: MapBoundsAdjusterProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !positions || positions.length === 0) {
      return;
    }

    // Si on a un seul point, centrer dessus avec un zoom fixe
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }

    // Si on a plusieurs points, calculer les bounds
    try {
      // Importer LatLngBounds dynamiquement
      import("leaflet").then((L) => {
        // Créer un objet LatLngBounds à partir des positions
        const bounds = L.latLngBounds(positions);

        // Ajuster la vue avec un padding pour ne pas couper les marqueurs
        map.fitBounds(bounds, {
          padding: [50, 50], // 50px de padding de chaque côté
          maxZoom: 15, // Zoom maximum pour éviter d'être trop proche
          animate: true,
          duration: 0.5,
        });
      });
    } catch (error) {
      console.error("Erreur lors de l'ajustement des bounds:", error);
    }
  }, [map, positions]);

  return null; // Ce composant ne rend rien
}
