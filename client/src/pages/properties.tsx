import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import PropertyCard from "@/components/property-card";
import PropertyMap from "@/components/map/property-map";
import { Search, Filter, MapPin, Home, Building, MapIcon, Map, Grid3X3 } from "lucide-react";
import { MAURITANIAN_CITIES } from "@/lib/currency";
import type { Property } from "@shared/schema";

interface SearchFilters {
  search?: string;
  type?: string;
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  rooms?: number;
}

export default function Properties() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString());
        }
      });
      const response = await fetch(`/api/properties?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('properties.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('properties.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t('properties.filters')}
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    {t('properties.clearFilters')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.search')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('properties.searchPlaceholder')}
                      value={filters.search || ""}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.type')}
                  </label>
                  <Select
                    value={filters.type || ""}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">{t('properties.types.sale')}</SelectItem>
                      <SelectItem value="rental">{t('properties.types.rental')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.propertyType')}
                  </label>
                  <Select
                    value={filters.propertyType || ""}
                    onValueChange={(value) => handleFilterChange("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.selectPropertyType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {t('properties.propertyTypes.apartment')}
                        </div>
                      </SelectItem>
                      <SelectItem value="house">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          {t('properties.propertyTypes.house')}
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {t('properties.propertyTypes.commercial')}
                        </div>
                      </SelectItem>
                      <SelectItem value="land">
                        <div className="flex items-center gap-2">
                          <MapIcon className="h-4 w-4" />
                          {t('properties.propertyTypes.land')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {t('properties.city')}
                  </label>
                  <Select
                    value={filters.city || ""}
                    onValueChange={(value) => handleFilterChange("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.cityPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {MAURITANIAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.priceRange')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t('properties.minPrice')}
                      value={filters.minPrice || ""}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : "")}
                    />
                    <Input
                      type="number"
                      placeholder={t('properties.maxPrice')}
                      value={filters.maxPrice || ""}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>

                {/* Surface Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.surfaceRange')} (m²)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t('properties.minSurface')}
                      value={filters.minSurface || ""}
                      onChange={(e) => handleFilterChange("minSurface", e.target.value ? Number(e.target.value) : "")}
                    />
                    <Input
                      type="number"
                      placeholder={t('properties.maxSurface')}
                      value={filters.maxSurface || ""}
                      onChange={(e) => handleFilterChange("maxSurface", e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('properties.rooms')}
                  </label>
                  <Select
                    value={filters.rooms?.toString() || ""}
                    onValueChange={(value) => handleFilterChange("rooms", value ? Number(value) : "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.selectRooms')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t('properties.room')}</SelectItem>
                      <SelectItem value="2">2 {t('properties.rooms')}</SelectItem>
                      <SelectItem value="3">3 {t('properties.rooms')}</SelectItem>
                      <SelectItem value="4">4 {t('properties.rooms')}</SelectItem>
                      <SelectItem value="5">5+ {t('properties.rooms')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoading ? (
                    "Chargement..."
                  ) : (
                    `${properties?.length || 0} bien(s) trouvé(s)`
                  )}
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeFiltersCount} filtre(s) appliqué(s)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grille
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="flex items-center gap-2"
                  >
                    <Map className="h-4 w-4" />
                    Carte
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Based on View Mode */}
            {viewMode === 'grid' ? (
              /* Properties Grid */
              isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Aucun résultat trouvé
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Essayez de modifier vos critères de recherche
                        </p>
                        {activeFiltersCount > 0 && (
                          <Button onClick={clearFilters} variant="outline">
                            Effacer les filtres
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              /* Map View */
              <div className="space-y-4">
                {isLoading ? (
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                    <p className="text-gray-500">Chargement de la carte...</p>
                  </div>
                ) : properties && properties.length > 0 ? (
                  <PropertyMap 
                    properties={properties} 
                    height="600px"
                    selectedPropertyId={selectedProperty?.id}
                    onPropertySelect={setSelectedProperty}
                  />
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Map className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Aucune propriété à afficher sur la carte
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Essayez de modifier vos critères de recherche
                          </p>
                          {activeFiltersCount > 0 && (
                            <Button onClick={clearFilters} variant="outline">
                              Effacer les filtres
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}