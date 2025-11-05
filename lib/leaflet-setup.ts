/**
 * Configuration partagée pour Leaflet
 * Évite la duplication de l'initialisation des icônes
 */

let leafletInitialized = false;

/**
 * Initialise Leaflet avec les icônes par défaut
 * Cette fonction est idempotente - elle ne s'exécute qu'une fois
 */
export async function initializeLeaflet() {
  if (leafletInitialized || typeof window === "undefined") {
    return;
  }

  try {
    const L = await import("leaflet");

    // Fix pour les icônes Leaflet avec Webpack/Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/pin.png",
      iconUrl: "/leaflet/pin.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });

    leafletInitialized = true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Leaflet:", error);
  }
}

/**
 * Réinitialise le flag d'initialisation (utile pour les tests)
 */
export function resetLeafletInitialization() {
  leafletInitialized = false;
}
