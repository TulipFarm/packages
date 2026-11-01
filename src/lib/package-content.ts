import content from '../../catalog/content.json' with { type: 'json' };

interface PackageContent {
  title: string;
  outcome?: string;
  description: string;
  introduction: string;
  audience: string;
  steps: string[];
  limitations: string;
  questions: { question: string; answer: string }[];
  related: string[];
}

export const packageContent = content as Record<string, PackageContent>;

export function getPackageContent(slug: string): PackageContent {
  const content = packageContent[slug];
  if (!content) throw new Error(`Missing package page content: ${slug}`);
  return content;
}
