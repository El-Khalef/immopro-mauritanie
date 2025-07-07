import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import PropertyTable from "@/components/admin/property-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Users, MessageSquare, TrendingUp, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administration.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: contactRequests = [] } = useQuery({
    queryKey: ["/api/contact-requests"],
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord administrateur</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérez vos propriétés immobilières en Mauritanie</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Biens total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalProperties || 5}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeUsers || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visites mensuelles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.monthlyVisits || 234}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Demandes de contact</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{contactRequests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contact Requests and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de contact récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactRequests.slice(0, 5).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{request.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.property?.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{request.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        request.status === 'pending' ? 'outline' :
                        request.status === 'contacted' ? 'secondary' : 'default'
                      }>
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'contacted' ? 'Contacté' : 'Fermé'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {contactRequests.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucune demande récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par ville</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Nouakchott</span>
                  </div>
                  <Badge variant="secondary">3 biens</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Nouadhibou</span>
                  </div>
                  <Badge variant="secondary">1 bien</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Rosso</span>
                  </div>
                  <Badge variant="secondary">1 bien</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Management */}
        <PropertyTable />
      </div>
    </div>
  );
}