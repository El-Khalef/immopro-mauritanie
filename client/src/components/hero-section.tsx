import SearchForm from "@/components/search-form";
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <SearchForm heroMode={true} />
        </div>
      </div>
    </div>
  );
}