import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
}

export default function PropertyCard({ property, isFavorite = false }: PropertyCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${property.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: property.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${property.id}/check`] });
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite 
          ? "Le bien a été retiré de vos favoris" 
          : "Le bien a été ajouté à vos favoris",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour gérer vos favoris",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string | number) => {
    return Number(price).toLocaleString('fr-FR');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour gérer vos favoris",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-48 object-cover" 
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <i className="fas fa-image text-4xl text-gray-400"></i>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
            property.type === 'sale' ? 'bg-emerald-500' : 'bg-blue-500'
          }`}>
            {property.type === 'sale' ? 'Vente' : 'Location'}
          </span>
        </div>
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          disabled={favoriteMutation.isPending}
        >
          <i className={`fas fa-heart ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}></i>
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4">{property.city} - {property.postalCode}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(property.price)}€
            {property.type === 'rental' && '/mois'}
          </span>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              <i className="fas fa-expand-arrows-alt mr-1"></i>
              {property.surface}m²
            </span>
            <span>
              <i className="fas fa-bed mr-1"></i>
              {property.rooms} pièces
            </span>
          </div>
        </div>
        
        <Link href={`/property/${property.id}`}>
          <Button className="w-full">
            Voir le détail
          </Button>
        </Link>
      </div>
    </div>
  );
}
