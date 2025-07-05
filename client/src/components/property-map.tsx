import { useEffect, useRef } from "react";
import { Property } from "@shared/schema";

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function PropertyMap({ 
  properties, 
  center = [48.8566, 2.3522], 
  zoom = 11,
  height = "h-96"
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add property markers
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = window.L.marker([
          Number(property.latitude), 
          Number(property.longitude)
        ]).addTo(mapInstanceRef.current);

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${property.title}</h3>
            <p class="text-xs text-gray-600 mb-1">${property.address}</p>
            <p class="font-semibold text-primary-600">
              ${Number(property.price).toLocaleString('fr-FR')}€
              ${property.type === 'rental' ? '/mois' : ''}
            </p>
            <div class="text-xs text-gray-500 mt-1">
              ${property.surface}m² • ${property.rooms} pièces
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Fit bounds if multiple properties
    if (properties.length > 1) {
      const validCoords = properties.filter(p => p.latitude && p.longitude);
      if (validCoords.length > 0) {
        const group = new window.L.featureGroup(
          validCoords.map(p => 
            window.L.marker([Number(p.latitude), Number(p.longitude)])
          )
        );
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }

    return () => {
      // Cleanup handled by React cleanup
    };
  }, [properties, center, zoom]);

  return (
    <div className="w-full">
      {/* Leaflet CSS loaded via CDN in the HTML head */}
      <div 
        ref={mapRef} 
        className={`w-full ${height} rounded-lg`}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}

// Extend window type for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
