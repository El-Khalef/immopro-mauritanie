import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import SearchForm from "@/components/search-form";
import PropertyCard from "@/components/property-card";
import PropertyMap from "@/components/property-map";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", searchFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return fetch(`/api/properties?${params}`).then(res => res.json());
    },
  });

  const { data: featuredProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
  });

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.firstName || 'Client'}
          </h1>
          <p className="text-gray-600">
            Découvrez nos dernières offres immobilières
          </p>
        </div>

        {/* Quick Search */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} compact />
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {Object.keys(searchFilters).length > 0 ? 'Résultats de recherche' : 'Tous les biens'}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={!showMap ? "default" : "outline"}
              onClick={() => setShowMap(false)}
            >
              <i className="fas fa-th-large mr-2"></i>
              Grille
            </Button>
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(true)}
            >
              <i className="fas fa-map mr-2"></i>
              Carte
            </Button>
          </div>
        </div>

        {/* Content */}
        {showMap ? (
          <PropertyMap properties={properties} />
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun bien trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    isFavorite={favorites.some((fav: any) => fav.propertyId === property.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Featured Properties for logged in users */}
        {Object.keys(searchFilters).length === 0 && !showMap && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Biens recommandés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 3).map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  isFavorite={favorites.some((fav: any) => fav.propertyId === property.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
