import type { CatalogEntry } from './catalog';

type Brand = 'jira' | 'linear' | 'zendesk';
export interface TemplatePresentation {
  outcome: string;
  brand?: Brand;
  table: string;
  layout: 'board' | 'records';
}

const presentations: Record<string, TemplatePresentation> = {
  'project-tracking': {
    outcome: 'Plan sprints. Track issues. Make the next step clear.',
    brand: 'jira',
    table: 'issues',
    layout: 'board',
  },
  'product-backlog': {
    outcome: 'Connect customer feedback to the work you prioritize.',
    brand: 'linear',
    table: 'backlog-items',
    layout: 'board',
  },
  'support-desk': {
    outcome: 'Organize support tickets and prepare replies for review.',
    brand: 'zendesk',
    table: 'tickets',
    layout: 'records',
  },
  'marketing-content': {
    outcome: 'Turn campaign ideas into briefs and editorial reviews.',
    table: 'content',
    layout: 'records',
  },
  'sales-crm': {
    outcome: 'Keep accounts, opportunities and next steps together.',
    table: 'opportunities',
    layout: 'records',
  },
  'leave-management': {
    outcome: 'Review time off with balances and policy in one place.',
    table: 'leave-requests',
    layout: 'records',
  },
};

export interface TemplateVisualData {
  title: string;
  fields: string[];
  statusLabel: string;
  tables: string[];
  rows: { key: string; title: string; status: string }[];
  layout: TemplatePresentation['layout'];
}

export function presentTemplate(entry: CatalogEntry) {
  const presentation = presentations[entry.slug] ?? {
    outcome: entry.useCases[0] ?? entry.document.package.description,
    table: '',
    layout: 'records' as const,
  };
  const tables = entry.document.resources.filter(resource => resource.kind === 'table');
  const table = tables.find(resource => resource.key === presentation.table) ?? tables[0];
  const titleField = table?.fields?.find(field => field.kind === 'text');
  const statusField = table?.fields?.find(field => field.key === 'status' || field.key === 'stage');
  const visual: TemplateVisualData = {
    title: table?.label ?? 'Package resources',
    fields: table?.fields?.slice(0, 3).map(field => field.label) ?? [],
    statusLabel: statusField?.label ?? 'Status',
    tables: tables.map(resource => resource.label ?? resource.key),
    layout: presentation.layout,
    rows: entry.document.resources
      .filter(resource => resource.kind === 'seed-row' && resource.table?.key === table?.key)
      .slice(0, 2)
      .map(row => {
        const title = titleField && row.values?.[titleField.key]?.value;
        const option = statusField && row.values?.[statusField.key]?.option;
        return {
          key: row.key,
          title: typeof title === 'string' ? title.replace(/^Example:\s*/i, '') : (row.label ?? row.key),
          status: statusField?.options?.find(item => item.key === option)?.label ?? '',
        };
      }),
  };
  return { ...presentation, visual };
}
