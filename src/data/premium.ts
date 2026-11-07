/**
 * Velocity Premium: the offer and the templates, shared by the home page
 * teaser and the /premium landing page.
 *
 * To release a template, move it from `plannedTemplates` to `liveTemplates`,
 * add its screenshot (1440×900, home page above the fold) under
 * `src/assets/templates/`, and list its main pages.
 */
import type { ImageMetadata } from 'astro';
import medicalPractice from '@/assets/templates/medical-practice.png';
import ecommerceStore from '@/assets/templates/ecommerce-store.png';
import realEstate from '@/assets/templates/real-estate.png';

export const checkoutUrl =
  'https://buy.polar.sh/polar_cl_nAA9sZJmlwO6K0MfkPojRrWnKblhcnyqiidG2217nf9';

export const price = '$199';

export const benefits = [
  'Every current and future template',
  'Full source, with a commercial license',
  'Unlimited sites, including client work',
  'English and Spanish, light and dark',
];

export interface LiveTemplate {
  name: string;
  category: string;
  brand: string;
  description: string;
  url: string;
  image: ImageMetadata;
  alt: string;
  pages: string[];
  isNew?: boolean;
}

/** Newest first: the first template leads the hero and the teaser. */
export const liveTemplates: LiveTemplate[] = [
  {
    name: 'Real Estate',
    category: 'Property and rentals',
    brand: 'Oakhaven Realty',
    description:
      'A local brokerage that sells, rents and manages homes, with listing pages, neighborhood guides, agent profiles and a residents area for tenants.',
    url: 'https://realestate.deployvelocity.com',
    image: realEstate,
    alt: 'Home page of the Real Estate template, for a fictional brokerage called Oakhaven Realty',
    pages: [
      'Homes for sale',
      'Rentals',
      'Sell',
      'Listings',
      'Neighborhoods',
      'Agents',
      'Property management',
      'Residents',
      'Mortgage calculator',
      'Blog',
    ],
    isNew: true,
  },
  {
    name: 'E-commerce Store',
    category: 'Retail and outdoor',
    brand: 'Northline',
    description:
      'An outdoor clothing brand with a lookbook, maker stories and a shop built around a few hero products.',
    url: 'https://store.deployvelocity.com',
    image: ecommerceStore,
    alt: 'Home page of the E-commerce Store template, for a fictional outdoor brand called Northline',
    pages: ['Shop', 'Lookbook', 'Field notes', 'Our makers', 'Help'],
  },
  {
    name: 'Medical Practice',
    category: 'Healthcare and wellness',
    brand: 'Velocity Health',
    description:
      'A family clinic with same-day visits, provider profiles, insurance details and a booking form on the home page.',
    url: 'https://medical.deployvelocity.com',
    image: medicalPractice,
    alt: 'Home page of the Medical Practice template, for a fictional clinic called Velocity Health',
    pages: ['Services', 'Providers', 'New patients', 'Insurance', 'Visit us'],
  },
];

export const plannedTemplates = [
  { name: 'Agency Portfolio', category: 'Studios and freelancers' },
  { name: 'Developer Blog', category: 'Writing and documentation' },
];
