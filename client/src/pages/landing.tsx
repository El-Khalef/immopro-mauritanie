import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import SearchForm from "@/components/search-form";
import PropertyCard from "@/components/property-card";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";

export default function Landing() {
  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      
      {/* Agency Presentation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Votre partenaire immobilier de confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Depuis 15 ans, ImmoPro accompagne particuliers et investisseurs dans leurs projets immobiliers avec expertise et transparence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-home text-primary-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1500+ Biens vendus</h3>
              <p className="text-gray-600">Une expertise reconnue sur tout le territoire</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3000+ Clients satisfaits</h3>
              <p className="text-gray-600">Un service personnalisé et de qualité</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">15 ans d'expérience</h3>
              <p className="text-gray-600">Une connaissance approfondie du marché</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Biens en vedette
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez notre sélection de biens d'exception
              </p>
            </div>
            <button className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-medium">
              Voir tous les biens
            </button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Advanced Search */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recherche avancée
            </h2>
            <p className="text-xl text-gray-600">
              Affinez votre recherche avec nos filtres détaillés
            </p>
          </div>
          
          <SearchForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">ImmoPro</h3>
              <p className="text-gray-400 mb-4">Votre partenaire immobilier de confiance depuis 15 ans.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Achat</a></li>
                <li><a href="#" className="hover:text-white">Vente</a></li>
                <li><a href="#" className="hover:text-white">Location</a></li>
                <li><a href="#" className="hover:text-white">Estimation</a></li>
                <li><a href="#" className="hover:text-white">Gestion locative</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Zones d'intervention</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Paris</a></li>
                <li><a href="#" className="hover:text-white">Île-de-France</a></li>
                <li><a href="#" className="hover:text-white">Lyon</a></li>
                <li><a href="#" className="hover:text-white">Marseille</a></li>
                <li><a href="#" className="hover:text-white">Toulouse</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p><i className="fas fa-phone mr-2"></i>01 23 45 67 89</p>
                <p><i className="fas fa-envelope mr-2"></i>contact@immopro.fr</p>
                <p><i className="fas fa-map-marker-alt mr-2"></i>123 Avenue des Champs-Élysées, 75008 Paris</p>
                <p><i className="fas fa-clock mr-2"></i>Lun-Ven: 9h-18h, Sam: 9h-17h</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ImmoPro. Tous droits réservés. | <a href="#" className="hover:text-white">Mentions légales</a> | <a href="#" className="hover:text-white">Politique de confidentialité</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
