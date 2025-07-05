import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const navItems = [
    { href: "/", label: "Accueil", active: location === "/" },
    { href: "/properties", label: "Biens", active: location.startsWith("/properties") },
    { href: "/search", label: "Recherche", active: location.startsWith("/search") },
    { href: "/about", label: "À propos", active: location === "/about" },
    { href: "/contact", label: "Contact", active: location === "/contact" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-600 cursor-pointer">ImmoPro</h1>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                    item.active 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* User Actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" className="relative">
                    <i className="fas fa-heart"></i>
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="ml-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="ml-2 hidden lg:block">
                          {user?.firstName || 'Mon compte'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <i className="fas fa-user mr-2"></i>
                        Mon profil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <i className="fas fa-heart mr-2"></i>
                        Mes favoris ({favorites.length})
                      </DropdownMenuItem>
                      {user?.isAdmin && (
                        <DropdownMenuItem>
                          <Link href="/admin">
                            <span className="flex items-center w-full">
                              <i className="fas fa-cog mr-2"></i>
                              Administration
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => window.location.href = '/api/login'}>
                    Connexion
                  </Button>
                  <Button onClick={() => window.location.href = '/api/login'}>
                    Inscription
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <i className="fas fa-bars"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
