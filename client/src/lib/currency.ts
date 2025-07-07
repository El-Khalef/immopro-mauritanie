/**
 * Utilitaires pour la gestion de la devise mauritanienne (MRU)
 */

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-MR', {
    style: 'currency',
    currency: 'MRU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceCompact(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M MRU`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K MRU`;
  }
  return formatPrice(price);
}

export function formatPriceRange(minPrice?: number, maxPrice?: number): string {
  if (!minPrice && !maxPrice) return '';
  if (!minPrice) return `Jusqu'à ${formatPriceCompact(maxPrice!)}`;
  if (!maxPrice) return `À partir de ${formatPriceCompact(minPrice)}`;
  return `${formatPriceCompact(minPrice)} - ${formatPriceCompact(maxPrice)}`;
}

// Valeurs par défaut pour les filtres de prix en MRU
export const PRICE_RANGES = {
  rental: [
    { min: 0, max: 50000, label: "Moins de 50K MRU" },
    { min: 50000, max: 100000, label: "50K - 100K MRU" },
    { min: 100000, max: 200000, label: "100K - 200K MRU" },
    { min: 200000, max: 500000, label: "200K - 500K MRU" },
    { min: 500000, max: undefined, label: "Plus de 500K MRU" },
  ],
  sale: [
    { min: 0, max: 5000000, label: "Moins de 5M MRU" },
    { min: 5000000, max: 10000000, label: "5M - 10M MRU" },
    { min: 10000000, max: 20000000, label: "10M - 20M MRU" },
    { min: 20000000, max: 50000000, label: "20M - 50M MRU" },
    { min: 50000000, max: undefined, label: "Plus de 50M MRU" },
  ],
};

// Villes principales de Mauritanie
export const MAURITANIAN_CITIES = [
  'Nouakchott',
  'Nouadhibou',
  'Rosso',
  'Kaédi',
  'Zouérat',
  'Atar',
  'Kiffa',
  'Néma',
  'Aleg',
  'Boutilimit',
];