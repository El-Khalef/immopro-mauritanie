import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { MAURITANIAN_CITIES } from "@/lib/currency";

interface SearchFormProps {
  onSearch?: (filters: any) => void;
  heroMode?: boolean;
  compact?: boolean;
}

export default function SearchForm({ onSearch, heroMode = false, compact = false }: SearchFormProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    type: '',
    propertyType: '',
    city: 'Nouakchott', // Ville par défaut pour la Mauritanie
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    maxSurface: '',
    rooms: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
    );
    onSearch?.(cleanFilters);
  };

  if (heroMode) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('search.property_type')}</label>
              <Select onValueChange={(value) => handleInputChange('propertyType', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('search.all_types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.all_types')}</SelectItem>
                  <SelectItem value="apartment">{t('search.apartment')}</SelectItem>
                  <SelectItem value="house">{t('search.house')}</SelectItem>
                  <SelectItem value="commercial">{t('search.commercial')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('search.city_placeholder')}</label>
              <Input 
                type="text" 
                placeholder={t('search.city_placeholder')} 
                value={filters.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix max</label>
              <Select onValueChange={(value) => handleInputChange('maxPrice', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tous prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous prix</SelectItem>
                  <SelectItem value="200000">200 000€</SelectItem>
                  <SelectItem value="500000">500 000€</SelectItem>
                  <SelectItem value="1000000">1 000 000€</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full">
                <i className="fas fa-search mr-2"></i>
                Rechercher
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vente/Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="sale">Vente</SelectItem>
                  <SelectItem value="rental">Location</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleInputChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de bien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="house">Maison</SelectItem>
                  <SelectItem value="commercial">Local commercial</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleInputChange('city', value)} value={filters.city}>
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  {MAURITANIAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input 
                type="number" 
                placeholder="Prix max" 
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              />

              <Button type="submit" className="w-full">
                <i className="fas fa-search mr-2"></i>
                Rechercher
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction</label>
              <Select onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vente/Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Vente</SelectItem>
                  <SelectItem value="rental">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de bien</label>
              <Select onValueChange={(value) => handleInputChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="house">Maison</SelectItem>
                  <SelectItem value="commercial">Local commercial</SelectItem>
                  <SelectItem value="land">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
              <Input 
                type="text" 
                placeholder="Ville, code postal..." 
                value={filters.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de pièces</label>
              <Select onValueChange={(value) => handleInputChange('rooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Indifférent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Indifférent</SelectItem>
                  <SelectItem value="1">1 pièce</SelectItem>
                  <SelectItem value="2">2 pièces</SelectItem>
                  <SelectItem value="3">3 pièces</SelectItem>
                  <SelectItem value="4">4 pièces</SelectItem>
                  <SelectItem value="5">5 pièces et +</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix minimum</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix maximum</label>
              <Input 
                type="number" 
                placeholder="Illimité" 
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surface minimum (m²)</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={filters.minSurface}
                onChange={(e) => handleInputChange('minSurface', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surface maximum (m²)</label>
              <Input 
                type="number" 
                placeholder="Illimitée" 
                value={filters.maxSurface}
                onChange={(e) => handleInputChange('maxSurface', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button type="submit" className="flex-1">
              <i className="fas fa-search mr-2"></i>
              Rechercher
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}