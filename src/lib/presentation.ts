import type { CatalogEntry } from './catalog';
import { packageContent } from './package-content';

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
  'sprint-issue-tracker': {
    outcome: 'Triage, plan and ship engineering work with a full history.',
    table: 'issues',
    layout: 'board',
  },
  'sla-ticket-desk': {
    outcome: 'Answer customers on time with SLAs, escalations and ratings.',
    table: 'tickets',
    layout: 'records',
  },
  'it-incident-desk': {
    outcome: 'Run incidents, problems and changes with approvals built in.',
    table: 'incidents',
    layout: 'records',
  },
  'team-wiki': {
    outcome: 'Keep team docs owned, reviewed and current.',
    table: 'pages',
    layout: 'records',
  },
  'client-retainers': {
    outcome: 'Deliver client work and bill every hour.',
    table: 'projects',
    layout: 'records',
  },
  'portfolio-planner': {
    outcome: 'Plan projects and catch slipping work early.',
    table: 'tasks',
    layout: 'board',
  },
  'deal-pipeline': {
    outcome: 'Move deals forward and never lose a renewal.',
    table: 'deals',
    layout: 'board',
  },
  'hiring-pipeline': {
    outcome: 'Hire with structured interviews and approved offers.',
    table: 'applications',
    layout: 'board',
  },
  'product-roadmap': {
    outcome: 'Turn customer evidence into a roadmap you can defend.',
    table: 'features',
    layout: 'board',
  },
  'account-health': {
    outcome: 'Spot account risk early and renew with confidence.',
    table: 'accounts',
    layout: 'records',
  },
  'employee-lifecycle': {
    outcome: 'Keep people records, onboarding and reviews on track.',
    table: 'employees',
    layout: 'records',
  },
  'compliance-controls': {
    outcome: 'Keep controls, evidence and risks audit-ready.',
    table: 'controls',
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
    outcome: packageContent[entry.slug]?.outcome ?? entry.useCases[0] ?? entry.document.package.description,
    table: '',
    layout: 'records' as const,
  };
  const tables = entry.document.resources.filter(resource => resource.kind === 'table');
  const seeds = entry.document.resources.filter(resource => resource.kind === 'seed-row');
  const seedCount = (key: string) => seeds.filter(row => row.table?.key === key).length;
  const table =
    tables.find(resource => resource.key === presentation.table) ??
    tables.reduce<(typeof tables)[number] | undefined>(
      (best, candidate) => (!best || seedCount(candidate.key) > seedCount(best.key) ? candidate : best),
      undefined,
    );
  const titleField = table?.fields?.find(field => field.kind === 'text');
  const statusField = table?.fields?.find(field => field.key === 'status' || field.key === 'stage');
  const visual: TemplateVisualData = {
    title: table?.label ?? 'Package resources',
    fields: table?.fields?.slice(0, 3).map(field => field.label) ?? [],
    statusLabel: statusField?.label ?? 'Status',
    tables: tables.map(resource => resource.label ?? resource.key),
    layout: presentation.layout,
    rows: seeds
      .filter(row => row.table?.key === table?.key)
      .slice(0, 3)
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
