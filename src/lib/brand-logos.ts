// Brand logo utility functions
// This module handles brand logo URLs and fallbacks

// Popular brand domains mapping for Clearbit API
const brandDomains: Record<string, string> = {
  'nike': 'nike.com',
  'adidas': 'adidas.com',
  'amazon': 'amazon.com',
  'target': 'target.com',
  'walmart': 'walmart.com',
  'bestbuy': 'bestbuy.com',
  'apple': 'apple.com',
  'microsoft': 'microsoft.com',
  'google': 'google.com',
  'facebook': 'facebook.com',
  'instagram': 'instagram.com',
  'twitter': 'twitter.com',
  'linkedin': 'linkedin.com',
  'youtube': 'youtube.com',
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'airbnb': 'airbnb.com',
  'booking.com': 'booking.com',
  'expedia': 'expedia.com',
  'mcdonalds': 'mcdonalds.com',
  'starbucks': 'starbucks.com',
  'subway': 'subway.com',
  'dominos': 'dominos.com',
  'pizza hut': 'pizzahut.com',
  'kfc': 'kfc.com',
  'burger king': 'bk.com',
  'taco bell': 'tacobell.com',
  'chipotle': 'chipotle.com',
  'dunkin': 'dunkindonuts.com',
  'home depot': 'homedepot.com',
  'lowes': 'lowes.com',
  'costco': 'costco.com',
  'sams club': 'samsclub.com',
  'cvs': 'cvs.com',
  'walgreens': 'walgreens.com',
  'rite aid': 'riteaid.com',
  'macys': 'macys.com',
  'nordstrom': 'nordstrom.com',
  'kohls': 'kohls.com',
  'jcpenney': 'jcpenney.com',
  'gap': 'gap.com',
  'old navy': 'oldnavy.gap.com',
  'banana republic': 'bananarepublic.gap.com',
  'h&m': 'hm.com',
  'zara': 'zara.com',
  'uniqlo': 'uniqlo.com',
  'forever 21': 'forever21.com',
  'american eagle': 'ae.com',
  'hollister': 'hollisterco.com',
  'abercrombie': 'abercrombie.com',
  'victorias secret': 'victoriassecret.com',
  'bath & body works': 'bathandbodyworks.com',
  'bed bath beyond': 'bedbathandbeyond.com',
  'williams sonoma': 'williams-sonoma.com',
  'pottery barn': 'potterybarn.com',
  'west elm': 'westelm.com',
  'crate barrel': 'crateandbarrel.com',
  'ikea': 'ikea.com',
  'wayfair': 'wayfair.com',
  'overstock': 'overstock.com',
};

// Get domain for brand name
export function getBrandDomain(brandName: string): string | null {
  const normalized = brandName.toLowerCase().trim();
  return brandDomains[normalized] || null;
}

// Get brand logo URL using Clearbit API (with fallback)
export function getBrandLogoUrl(brandName: string, size: number = 64): string {
  const domain = getBrandDomain(brandName);
  
  // Always try Clearbit API first if we have a domain mapping
  if (domain) {
    return `https://logo.clearbit.com/${domain}?size=${size}`;
  }
  
  // For brands without domain mapping, try a generic domain pattern
  const normalized = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized) {
    return `https://logo.clearbit.com/${normalized}.com?size=${size}`;
  }
  
  // Final fallback to branded placeholder service
  return getBrandedPlaceholderUrl(brandName, size);
}

// Check if we have a high-quality logo for this brand
export function hasHighQualityLogo(brandName: string): boolean {
  return getBrandDomain(brandName) !== null;
}

// Get brand logo with multiple fallback strategies
export function getBrandLogoWithFallbacks(brandName: string, size: number = 64): string[] {
  const urls: string[] = [];
  
  // Primary: Clearbit API if we have domain
  const domain = getBrandDomain(brandName);
  if (domain) {
    urls.push(`https://logo.clearbit.com/${domain}?size=${size}`);
  }
  
  // Secondary: Try common domain patterns
  const normalized = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  urls.push(`https://logo.clearbit.com/${normalized}.com?size=${size}`);
  
  // Tertiary: Placeholder service
  const encodedBrand = encodeURIComponent(brandName.toLowerCase());
  urls.push(`https://ui-avatars.com/api/?name=${encodedBrand}&size=${size}&background=f3f4f6&color=374151&format=png&rounded=true&bold=true`);
  
  return urls;
}

// Brand color schemes for better fallback avatars
const brandColors: Record<string, { bg: string; text: string }> = {
  'nike': { bg: '000000', text: 'ffffff' },
  'adidas': { bg: '000000', text: 'ffffff' },
  'amazon': { bg: 'ff9900', text: '000000' },
  'target': { bg: 'cc0000', text: 'ffffff' },
  'walmart': { bg: '004c91', text: 'ffffff' },
  'bestbuy': { bg: '003087', text: 'ffffff' },
  'best buy': { bg: '003087', text: 'ffffff' },
  'apple': { bg: '000000', text: 'ffffff' },
  'microsoft': { bg: '0078d4', text: 'ffffff' },
  'google': { bg: '4285f4', text: 'ffffff' },
  'facebook': { bg: '1877f2', text: 'ffffff' },
  'instagram': { bg: 'e4405f', text: 'ffffff' },
  'twitter': { bg: '1da1f2', text: 'ffffff' },
  'linkedin': { bg: '0077b5', text: 'ffffff' },
  'youtube': { bg: 'ff0000', text: 'ffffff' },
  'netflix': { bg: 'e50914', text: 'ffffff' },
  'spotify': { bg: '1db954', text: 'ffffff' },
  'starbucks': { bg: '00704a', text: 'ffffff' },
  'mcdonalds': { bg: 'ffcc00', text: 'da020e' },
  'burger king': { bg: 'd62300', text: 'ffffff' },
  'subway': { bg: '008c15', text: 'ffffff' },
  'kfc': { bg: 'f40027', text: 'ffffff' },
  'pizza hut': { bg: 'ee3124', text: 'ffffff' },
  'dominos': { bg: '0078ae', text: 'ffffff' },
  'taco bell': { bg: '7b3f98', text: 'ffffff' },
  'chipotle': { bg: 'a81612', text: 'ffffff' },
  'dunkin': { bg: 'ff6600', text: 'ffffff' },
  'h&m': { bg: 'e50010', text: 'ffffff' },
  'zara': { bg: '000000', text: 'ffffff' },
  'uniqlo': { bg: 'ff0000', text: 'ffffff' },
  'gap': { bg: '004b87', text: 'ffffff' },
  'old navy': { bg: '004b87', text: 'ffffff' },
  'forever 21': { bg: 'ffcc00', text: '000000' },
  'american eagle': { bg: '1e3a5f', text: 'ffffff' },
  'hollister': { bg: '1e3a5f', text: 'ffffff' },
  'abercrombie': { bg: '1e3a5f', text: 'ffffff' },
  'home depot': { bg: 'f96302', text: 'ffffff' },
  'lowes': { bg: '004990', text: 'ffffff' },
  'costco': { bg: '0066b2', text: 'ffffff' },
  'cvs': { bg: 'cc0000', text: 'ffffff' },
  'walgreens': { bg: 'e31837', text: 'ffffff' },
  'macys': { bg: 'e21a2c', text: 'ffffff' },
  'nordstrom': { bg: '000000', text: 'ffffff' },
  'kohls': { bg: '6633cc', text: 'ffffff' },
  'uber': { bg: '000000', text: 'ffffff' },
  'lyft': { bg: 'ff00bf', text: 'ffffff' },
  'airbnb': { bg: 'ff5a5f', text: 'ffffff' },
};

// Get brand-specific colors
export function getBrandColors(brandName: string): { bg: string; text: string } {
  const normalized = brandName.toLowerCase().trim();
  return brandColors[normalized] || { bg: 'f3f4f6', text: '374151' };
}

// Generate a branded placeholder URL
export function getBrandedPlaceholderUrl(brandName: string, size: number = 64): string {
  const colors = getBrandColors(brandName);
  const encodedBrand = encodeURIComponent(brandName.toLowerCase());
  return `https://ui-avatars.com/api/?name=${encodedBrand}&size=${size}&background=${colors.bg}&color=${colors.text}&format=png&rounded=true&bold=true`;
} 