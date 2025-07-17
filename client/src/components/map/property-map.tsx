import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@shared/schema';
import { formatPrice } from '@/lib/currency';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const saleIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#2563eb"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <text x="12.5" y="16" text-anchor="middle" font-family="Arial" font-size="8" fill="#2563eb">V</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const rentalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#059669"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <text x="12.5" y="16" text-anchor="middle" font-family="Arial" font-size="8" fill="#059669">L</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  selectedPropertyId?: number;
  onPropertySelect?: (property: Property) => void;
}

export default function PropertyMap({ 
  properties, 
  height = "400px", 
  selectedPropertyId,
  onPropertySelect 
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Centre de la carte sur Nouakchott, Mauritanie
  const mauritaniaCenter: [number, number] = [18.0735, -15.9582];
  const defaultZoom = 6;

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

  // Filtrer les propriétés qui ont des coordonnées
  const propertiesWithCoords = properties.filter(
    property => property.latitude && property.longitude
  );

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={mauritaniaCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {propertiesWithCoords.map((property) => {
          const lat = parseFloat(property.latitude!);
          const lng = parseFloat(property.longitude!);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          const icon = property.type === 'sale' ? saleIcon : rentalIcon;
          
          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onPropertySelect?.(property)
              }}
            >
              <Popup>
                <div className="w-64">
                  <Card>
                    <CardContent className="p-3">
                      {property.images && property.images.length > 0 && (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                      )}
                      <h3 className="font-semibold text-sm mb-2">{property.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={property.type === 'sale' ? 'default' : 'secondary'}>
                          {property.type === 'sale' ? 'Vente' : 'Location'}
                        </Badge>
                        <span className="font-bold text-primary">
                          {formatPrice(property.price)}
                          {property.type === 'rental' && '/mois'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.surface}m² • {property.rooms} pièces
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {property.address}, {property.city}
                      </p>
                      <Link href={`/property/${property.id}`}>
                        <button className="w-full bg-primary text-white py-2 px-3 rounded text-sm hover:bg-primary/90">
                          Voir le détail
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}