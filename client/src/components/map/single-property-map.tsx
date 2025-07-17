import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@shared/schema';
import 'leaflet/dist/leaflet.css';

// Configuration de l'icône Leaflet
const propertyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="45" viewBox="0 0 30 45">
      <path d="M15 0C6.7 0 0 6.7 0 15C0 23.3 15 45 15 45S30 23.3 30 15C30 6.7 23.3 0 15 0Z" fill="#dc2626"/>
      <circle cx="15" cy="15" r="8" fill="white"/>
      <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="10" fill="#dc2626">P</text>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -40]
});

interface SinglePropertyMapProps {
  property: Property;
  height?: string;
}

export default function SinglePropertyMap({ property, height = "300px" }: SinglePropertyMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    );
  }

  // Vérifier si la propriété a des coordonnées
  if (!property.latitude || !property.longitude) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Localisation non disponible</p>
      </div>
    );
  }

  const lat = parseFloat(property.latitude);
  const lng = parseFloat(property.longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Coordonnées invalides</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[lat, lng]} icon={propertyIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">{property.title}</h3>
              <p className="text-sm text-gray-600">{property.address}</p>
              <p className="text-sm text-gray-600">{property.city}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}