import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import PropertyMap from "@/components/property-map";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  type: z.enum(["visit", "info", "offer"]),
});

export default function PropertyDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  const { data: favoriteCheck } = useQuery({
    queryKey: [`/api/favorites/${id}/check`],
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: '',
      message: '',
      type: 'info',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      await apiRequest("POST", "/api/contact-requests", {
        ...data,
        propertyId: Number(id),
        userId: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été envoyée avec succès. Nous vous recontacterons rapidement.",
      });
      setContactDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (favoriteCheck?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: Number(id) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: favoriteCheck?.isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: favoriteCheck?.isFavorite 
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

  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    contactMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Bien introuvable</h1>
            <p className="text-gray-600 mt-2">Ce bien n'existe pas ou n'est plus disponible.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left mr-2"></i>
            Retour
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-rows-2 gap-4">
                {property.images.slice(1, 3).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${property.title} - ${index + 2}`}
                    className="w-full h-44 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <i className="fas fa-image text-6xl text-gray-400"></i>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.type === 'sale' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {property.type === 'sale' ? 'Vente' : 'Location'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {property.propertyType === 'apartment' ? 'Appartement' : 
                   property.propertyType === 'house' ? 'Maison' : 
                   property.propertyType === 'commercial' ? 'Local commercial' : 'Terrain'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{property.address}</p>
              
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <span className="flex items-center">
                  <i className="fas fa-expand-arrows-alt mr-2"></i>
                  {property.surface} m²
                </span>
                <span className="flex items-center">
                  <i className="fas fa-bed mr-2"></i>
                  {property.rooms} pièces
                </span>
                {property.bedrooms && (
                  <span className="flex items-center">
                    <i className="fas fa-moon mr-2"></i>
                    {property.bedrooms} chambres
                  </span>
                )}
              </div>

              <div className="text-4xl font-bold text-primary-600 mb-6">
                {Number(property.price).toLocaleString('fr-FR')}€
                {property.type === 'rental' && '/mois'}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Équipements</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <i className="fas fa-phone mr-2"></i>
                        Contacter l'agence
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Contacter l'agence</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type de demande</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionnez le type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="info">Demande d'information</SelectItem>
                                    <SelectItem value="visit">Planifier une visite</SelectItem>
                                    <SelectItem value="offer">Faire une offre</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom complet</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone (optionnel)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={4} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={contactMutation.isPending}
                          >
                            {contactMutation.isPending ? "Envoi..." : "Envoyer"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {isAuthenticated && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => favoriteMutation.mutate()}
                      disabled={favoriteMutation.isPending}
                    >
                      <i className={`fas fa-heart mr-2 ${favoriteCheck?.isFavorite ? 'text-red-500' : ''}`}></i>
                      {favoriteCheck?.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Informations de contact</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><i className="fas fa-phone mr-2"></i>01 23 45 67 89</p>
                    <p><i className="fas fa-envelope mr-2"></i>contact@immopro.fr</p>
                    <p><i className="fas fa-clock mr-2"></i>Lun-Ven: 9h-18h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        {property.latitude && property.longitude && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Localisation</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <PropertyMap 
                properties={[property]} 
                center={[Number(property.latitude), Number(property.longitude)]}
                zoom={15}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
