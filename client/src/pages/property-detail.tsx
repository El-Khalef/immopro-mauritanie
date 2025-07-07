import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, MapPin, Home, Square, Bed, Calendar, Star, Phone, Mail, MessageSquare, ChevronLeft, ChevronRight, Share2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactRequestSchema } from "@shared/schema";
import type { Property } from "@shared/schema";
import { formatPrice } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactFormSchema = insertContactRequestSchema.extend({
  type: z.enum(["visit", "info", "offer"]),
});

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      propertyId: Number(id),
      name: user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: "",
      message: "",
      type: "info",
    },
  });

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });

  const { data: isFavoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", id, "check"],
    enabled: !!id && isAuthenticated,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavoriteData?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: Number(id) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", id, "check"] });
      toast({
        title: isFavoriteData?.isFavorite ? t('property.removedFromFavorites') : t('property.addedToFavorites'),
        description: isFavoriteData?.isFavorite ? t('property.removedFromFavoritesDesc') : t('property.addedToFavoritesDesc'),
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      await apiRequest("POST", "/api/contact-requests", data);
    },
    onSuccess: () => {
      setContactDialogOpen(false);
      form.reset();
      toast({
        title: t('property.contactSent'),
        description: t('property.contactSentDesc'),
      });
    },
  });

  const onContactSubmit = (data: z.infer<typeof contactFormSchema>) => {
    contactMutation.mutate(data);
  };

  const shareProperty = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing or sharing failed
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('property.linkCopied'),
        description: t('property.linkCopiedDesc'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('property.notFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('property.notFoundDescription')}
          </p>
          <Link href="/properties">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('property.backToProperties')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
    }
  };

  const previousImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/properties">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('property.backToProperties')}
            </Button>
          </Link>
        </div>

        {/* Property Images Gallery */}
        <div className="relative mb-8">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Home className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white"
              onClick={shareProperty}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {isAuthenticated && (
              <Button
                variant={isFavoriteData?.isFavorite ? "default" : "outline"}
                size="icon"
                className={isFavoriteData?.isFavorite ? "" : "bg-white/80 hover:bg-white"}
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavoriteData?.isFavorite ? "fill-current text-white" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={property.type === "sale" ? "default" : "secondary"}>
                  {t(`property.types.${property.type}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`property.propertyTypes.${property.propertyType}`)}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}, {property.city} {property.postalCode}
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(property.price)}
                {property.type === "rental" && (
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                    /{t('property.perMonth')}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Square className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{property.surface} m²</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('property.surface')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{property.rooms}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {property.rooms === 1 ? t('property.room') : t('property.rooms')}
                  </div>
                </div>
              </div>
              {property.bedrooms && (
                <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {property.bedrooms === 1 ? t('property.bedroom') : t('property.bedrooms')}
                    </div>
                  </div>
                </div>
              )}
              {property.availableFrom && (
                <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{formatDate(property.availableFrom.toString())}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('property.availableFrom')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('property.description')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t('property.features')}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Contact Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('property.contactAgent')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t('property.sendMessage')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('property.contactForm')}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onContactSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('property.name')}</FormLabel>
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
                              <FormLabel>{t('property.email')}</FormLabel>
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
                              <FormLabel>{t('property.phone')}</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('property.requestType')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="visit">{t('property.requestTypes.visit')}</SelectItem>
                                  <SelectItem value="info">{t('property.requestTypes.info')}</SelectItem>
                                  <SelectItem value="offer">{t('property.requestTypes.offer')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('property.message')}</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
                          {contactMutation.isPending ? t('property.sending') : t('property.sendMessage')}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  {t('property.callNow')}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('property.sendEmail')}
                </Button>
                <Separator />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">{t('property.contactInfo')}</p>
                  <p className="font-semibold">ImmoPro Agency</p>
                  <p>+33 1 23 45 67 89</p>
                  <p>contact@immopro.fr</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('property.propertyStats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('property.status')}</span>
                  <Badge variant={property.status === "available" ? "default" : "secondary"}>
                    {t(`property.statuses.${property.status}`)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('property.listed')}</span>
                  <span>{formatDate(property.createdAt?.toString() || "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('property.propertyId')}</span>
                  <span>#{property.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}