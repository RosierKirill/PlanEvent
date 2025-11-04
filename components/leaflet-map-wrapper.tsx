"use client";

/**
 * Wrapper optimisé pour les composants Leaflet
 * Consolide tous les imports en un seul pour réduire les chunks
 */

import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Types exportés
export type { LatLngExpression, LeafletMap };

// Composants exportés
export { MapContainer, Marker, Popup, TileLayer };
