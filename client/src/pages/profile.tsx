import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { User, Heart, MessageSquare, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('auth.unauthorized'),
        description: t('auth.login_required'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  // Fetch user favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  // Fetch user contact requests
  const { data: contactRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/contact-requests/user'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header with user info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || user.email} />
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {user.email}
                  </CardDescription>
                  <div className="mt-2">
                    <Badge variant="secondary">
                      <User className="w-3 h-3 mr-1" />
                      {t('profile.member')}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('profile.edit')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/api/logout'}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('profile.favorites')}
                </CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {favoritesLoading ? "..." : favorites.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('profile.saved_properties')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('profile.messages')}
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requestsLoading ? "..." : contactRequests.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('profile.contact_requests')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('profile.member_since')}
                </CardTitle>
                <User className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('profile.years_member')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Favorites Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                {t('profile.my_favorites')}
              </CardTitle>
              <CardDescription>
                {t('profile.favorites_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('profile.no_favorites')}</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/'}>
                    {t('profile.browse_properties')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.slice(0, 6).map((favorite: any) => (
                    <div key={favorite.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-200 rounded-md mb-3"></div>
                      <h3 className="font-semibold text-sm mb-1">{favorite.property?.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{favorite.property?.city}</p>
                      <p className="text-blue-600 font-bold text-sm">{favorite.property?.price}€</p>
                    </div>
                  ))}
                </div>
              )}
              {favorites.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    {t('profile.view_all_favorites')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Requests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                {t('profile.my_messages')}
              </CardTitle>
              <CardDescription>
                {t('profile.messages_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : contactRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('profile.no_messages')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">{request.property?.title}</h3>
                        <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                          {t(`profile.status_${request.status}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{request.message}</p>
                      <p className="text-xs text-gray-500">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {contactRequests.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    {t('profile.view_all_messages')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}