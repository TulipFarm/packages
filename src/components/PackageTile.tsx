import ArrowUpRight from 'reicon-react/icons/ArrowUpRight';
import Briefcase from 'reicon-react/icons/Briefcase';
import Handshake from 'reicon-react/icons/Handshake';
import Sparkles from 'reicon-react/icons/Sparkles';
import Headset from 'reicon-react/icons/Headset';
import Code from 'reicon-react/icons/Code';
import Users from 'reicon-react/icons/Users';
import Setting2 from 'reicon-react/icons/Setting2';
import Wallet from 'reicon-react/icons/Wallet';
import ShieldCheck from 'reicon-react/icons/ShieldCheck';
import Scale from 'reicon-react/icons/Scale';
import Building from 'reicon-react/icons/Building';
import { categoryHues } from '../lib/categories';
import type { Category } from '../lib/catalog';

const categoryIcons: Record<Category, typeof Briefcase> = {
  'Agency & client services': Briefcase,
  Sales: Handshake,
  Marketing: Sparkles,
  'Support & success': Headset,
  'Product & engineering': Code,
  'People & HR': Users,
  Operations: Setting2,
  Finance: Wallet,
  'IT & security': ShieldCheck,
  'Legal & compliance': Scale,
  Industry: Building,
};

export interface PackageTileData {
  slug: string;
  title: string;
  category: string;
  detailPath: string;
  outcome: string;
}

export function CategoryIcon({ category, size = 16 }: { category: string; size?: number }) {
  const Icon = categoryIcons[category as Category] ?? Briefcase;
  return <Icon size={size} aria-hidden="true" />;
}

export default function PackageTile({ entry }: { entry: PackageTileData }) {
  const hue = categoryHues[entry.category as Category] ?? 150;
  return (
    <a className="package-tile" href={entry.detailPath} style={{ '--tile-hue': hue } as React.CSSProperties}>
      <span className="package-tile-icon">
        <CategoryIcon category={entry.category} size={16} />
      </span>
      <ArrowUpRight className="package-tile-arrow" size={16} aria-hidden="true" />
      <h3>{entry.title}</h3>
      <p>{entry.outcome}</p>
    </a>
  );
}
