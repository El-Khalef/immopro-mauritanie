import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import PropertyForm from "./property-form";

export default function PropertyTable() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/featured"] });
      toast({
        title: "Bien supprimé",
        description: "Le bien a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous n'avez pas les droits pour effectuer cette action.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du bien.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bien ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedProperty(undefined);
    setFormOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      available: "bg-green-100 text-green-800",
      sold: "bg-red-100 text-red-800",
      rented: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    const statusLabels = {
      available: "Disponible",
      sold: "Vendu",
      rented: "Loué",
      pending: "En cours",
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusClasses[status as keyof typeof statusClasses] || statusClasses.available
      }`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Gestion des biens</h3>
        <Button onClick={handleAddNew}>
          <i className="fas fa-plus mr-2"></i>
          Ajouter un bien
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bien
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          className="h-10 w-10 rounded-lg object-cover" 
                          src={property.images[0]} 
                          alt={property.title} 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-image text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {property.type === 'sale' ? 'Vente' : 'Location'}
                    </div>
                    <div className="text-gray-500">
                      {property.propertyType === 'apartment' ? 'Appartement' :
                       property.propertyType === 'house' ? 'Maison' :
                       property.propertyType === 'commercial' ? 'Commercial' : 'Terrain'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Number(property.price).toLocaleString('fr-FR')}€
                  {property.type === 'rental' && '/mois'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(property.status || 'available')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(property)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-home text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bien
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter votre premier bien immobilier.
            </p>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Ajouter un bien
            </Button>
          </div>
        )}
      </div>

      <PropertyForm
        property={selectedProperty}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  );
}
