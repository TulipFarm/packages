import { BrandIcon, BrandTile } from '@tulipfarm/sprout/brand-icon';
import Calendar from 'reicon-react/icons/Calendar';
import Briefcase from 'reicon-react/icons/Briefcase';
import Pen from 'reicon-react/icons/Pen';
import ResourceIcon from './ResourceIcon';
import type { TemplatePresentation } from '../lib/presentation';

export default function TemplateIdentity({
  slug,
  brand,
  large = false,
}: {
  slug: string;
  brand?: TemplatePresentation['brand'];
  large?: boolean;
}) {
  const Icon = slug === 'leave-management' ? Calendar : slug === 'sales-crm' ? Briefcase : Pen;
  return (
    <BrandTile size={large ? 'xl' : 'md'} aria-hidden="true">
      {brand ? (
        <BrandIcon brand={brand} size="fill" />
      ) : ['leave-management', 'sales-crm', 'marketing-content'].includes(slug) ? (
        <Icon size={large ? 24 : 20} />
      ) : (
        <ResourceIcon kind="table" />
      )}
    </BrandTile>
  );
}

export function styleLabel(brand: TemplatePresentation['brand']) {
  return brand ? `${brand[0].toUpperCase()}${brand.slice(1)}-style starter` : 'TulipFarm package';
}
