import type { Category } from './catalog';

export const categoryHues: Record<Category, number> = {
  'Agency & client services': 35,
  Sales: 250,
  Marketing: 330,
  'Support & success': 65,
  'Product & engineering': 295,
  'People & HR': 150,
  Operations: 195,
  Finance: 120,
  'IT & security': 225,
  'Legal & compliance': 90,
  Industry: 15,
};

export const categoryOrder = Object.keys(categoryHues) as Category[];
