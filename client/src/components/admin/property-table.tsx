import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPrice } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
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
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      available: "default",
      sold: "destructive", 
      rented: "secondary",
      pending: "outline",
    };

    const labels: { [key: string]: string } = {
      available: "Disponible",
      sold: "Vendu",
      rented: "Loué",
      pending: "En cours",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === "sale" ? "Vente" : "Location"}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des biens immobiliers</CardTitle>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un bien
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bien</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vedette</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={property.images[0]} 
                            alt={property.title} 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">📷</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.surface}m² • {property.rooms} pièces
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getTypeBadge(property.type)}
                      <div className="text-sm text-gray-500">
                        {property.propertyType === "apartment" && "Appartement"}
                        {property.propertyType === "house" && "Maison"}
                        {property.propertyType === "commercial" && "Commercial"}
                        {property.propertyType === "land" && "Terrain"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(property.price)}
                      {property.type === "rental" && (
                        <span className="text-sm text-gray-500">/mois</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {property.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(property.status)}
                  </TableCell>
                  <TableCell>
                    {property.featured ? (
                      <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                        ⭐ Vedette
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {properties.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">Aucun bien trouvé</div>
              <Button onClick={handleAddNew} className="mt-4">
                Ajouter le premier bien
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PropertyForm 
        property={selectedProperty}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  );
}