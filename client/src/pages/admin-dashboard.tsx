import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import PropertyTable from "@/components/admin/property-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-600 mt-2">Gérez vos biens, utilisateurs et demandes</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full">
                  <i className="fas fa-home text-primary-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Biens total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <i className="fas fa-users text-emerald-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Clients actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full">
                  <i className="fas fa-calendar text-orange-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Demandes ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.monthlyVisits || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <i className="fas fa-euro-sign text-red-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">CA ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.monthlyRevenue || "0€"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Property Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gestion des biens</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyTable />
          </CardContent>
        </Card>

        {/* Recent Contact Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de contact récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contactRequests.slice(0, 5).map((request: any) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.property?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.type === 'visit' ? 'Visite' : request.type === 'info' ? 'Information' : 'Offre'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status === 'pending' ? 'En attente' : request.status === 'contacted' ? 'Contacté' : 'Fermé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
