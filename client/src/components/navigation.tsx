import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/language-switcher";

export default function Navigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Récupérer les favoris de l'utilisateur
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const navItems = [
    { href: "/", label: t('navigation.home'), active: location === "/" },
    { href: "/properties", label: t('navigation.properties'), active: location.startsWith("/properties") },
    { href: "/about", label: t('navigation.about'), active: location === "/about" },
    { href: "/contact", label: t('navigation.contact'), active: location === "/contact" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-xl font-bold text-primary-600 cursor-pointer">
                ImmoPro
              </span>
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

          {/* Right side - Language switcher and Auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.profileImageUrl || ""} 
                        alt={user?.firstName || "User"} 
                      />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.firstName && (
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem>
                    <Link href="/favorites">
                      <span className="flex items-center w-full">
                        <i className="fas fa-heart mr-2"></i>
                        {t('navigation.favorites')} ({favorites.length})
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem>
                      <Link href="/admin">
                        <span className="flex items-center w-full">
                          <i className="fas fa-cog mr-2"></i>
                          {t('navigation.admin')}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <a href="/api/logout" className="flex items-center w-full">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      {t('navigation.logout')}
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <a href="/api/login">
                  <Button>
                    {t('navigation.login')}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}