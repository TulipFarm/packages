interface PackageContent {
  title: string;
  description: string;
  introduction: string;
  audience: string;
  steps: string[];
  limitations: string;
  questions: { question: string; answer: string }[];
  related: string[];
}

export const packageContent: Record<string, PackageContent> = {
  'leave-management': {
    title: 'Leave Management Package',
    description:
      'Explore an open-source leave management package with policy, balance and request tables, a read-only assistant, and a manual review workflow for TulipFarm.',
    introduction:
      'The leave management package brings time-off requests, recorded balances and policy guidance into one TulipFarm workspace. Each request links to a balance record, which links to a policy. Managers can inspect the evidence behind a request before making a decision.',
    audience:
      'For HR teams and managers who need a small, editable starting point for leave review. The included records use demonstration policies and employee aliases, not real employee data.',
    steps: [
      'After installation, replace the demonstration policy and balances with your own reviewed records. Keep the balance date so reviewers can judge whether the figures are current.',
      'Record the request dates, requested working days and coverage plan. Link the request to the relevant employee balance.',
      'Start the manual review workflow to prepare a recommendation. A person checks missing information and makes the leave decision.',
    ],
    limitations:
      'This package does not calculate holiday calendars, sync payroll or approve leave automatically. Recorded allowances are illustrative, not legal or employment advice. The assistant reads records; it does not change balances or approve requests.',
    questions: [
      {
        question: 'Does the leave management package calculate working days?',
        answer:
          'No. Requested working days are recorded as an input. The package does not include a holiday calendar or payroll connection, so a person must check the dates and day count.',
      },
      {
        question: 'Can the leave assistant approve a request?',
        answer:
          'No. The assistant provides read-only analysis and marks missing evidence. A person remains responsible for the decision and any record changes.',
      },
    ],
    related: ['project-tracking', 'support-desk'],
  },
  'marketing-content': {
    title: 'Marketing Content Package',
    description:
      'Explore an open-source marketing package for campaign briefs, content calendars and editorial reviews, with a read-only assistant and a manual review workflow.',
    introduction:
      'The marketing content package connects campaigns, content items and editorial reviews in TulipFarm. Campaign records hold the audience, goal and core message. Content items link that context to a channel, target date, brief and supporting evidence.',
    audience:
      'For marketing teams and writers who want a shared place to plan content and collect review feedback before publishing. The package provides editable records and a review procedure, not a publishing service.',
    steps: [
      'After installation, define a campaign audience, goal and core message before adding content items.',
      'Build the content calendar with target dates, briefs and evidence for claims. Link each item to its campaign.',
      'Use the manual review workflow to prepare recommendations, then record editorial feedback and decisions. A person publishes through the chosen channel.',
    ],
    limitations:
      'There are no connected publishing channels, automatic posts or scheduled publishing jobs. The assistant cannot send messages or edit records. A person must verify claims, approve content and publish it.',
    questions: [
      {
        question: 'Can this package publish blog posts or social content?',
        answer:
          'No. It organizes campaign briefs, content items and editorial reviews. Publishing happens outside this package after a person reviews the content.',
      },
      {
        question: 'Where does the evidence for marketing claims go?',
        answer:
          'Each content item includes a Claim evidence field. The review procedure can use recorded evidence and flag gaps, but a person must verify the sources before publishing.',
      },
    ],
    related: ['sales-crm', 'product-backlog'],
  },
  'sales-crm': {
    title: 'Sales CRM Package',
    description:
      'Explore an open-source sales CRM package with accounts, opportunities and activity records, plus a read-only deal assistant and a manual review workflow.',
    introduction:
      'The sales CRM package organizes accounts, opportunities and sales activities in TulipFarm. Opportunities link to accounts and carry a stage, value, currency, target close date and next step. Activity records keep the notes behind a deal review in the same system.',
    audience:
      'For founders and small sales teams who need a clear record of customer needs, deal stages and follow-up work. It is a starting point for a sales process, not a full CRM replacement.',
    steps: [
      'After installation, add account records with customer needs, segments and contact roles.',
      'Link opportunities to accounts and record the current stage, value and next step. Add dated activity notes as the conversation develops.',
      'Start the manual review workflow to examine deal evidence and missing next steps. A person decides what to do and contacts the customer.',
    ],
    limitations:
      'The package has no email sync, automatic outreach or automated forecasting. Deal values and stages come from recorded data. The assistant cannot modify opportunities or send follow-up messages.',
    questions: [
      {
        question: 'Does the sales CRM package connect to email?',
        answer:
          'No. Accounts, opportunities and activity notes are stored in the package tables. Email sync and automatic follow-up sending are not included.',
      },
      {
        question: 'Can I track deals in different currencies?',
        answer:
          'An opportunity has separate Value and Currency fields. The package does not include exchange-rate conversion or consolidated revenue forecasting.',
      },
    ],
    related: ['marketing-content', 'support-desk'],
  },
  'support-desk': {
    title: 'Support Desk Package',
    description:
      'Explore an open-source support desk package with queues, tickets and notes, plus a read-only assistant for reply review. A Zendesk-style starting point.',
    introduction:
      'The support desk package brings support queues, tickets and ticket notes into TulipFarm. Each queue can carry scope and escalation guidance. Tickets record the problem, priority, status and next step so reviewers can see what still needs attention.',
    audience:
      'For support teams exploring a small, editable ticket-review system. Its Zendesk-style organization is a reference to the workflow, not an affiliation, integration or full replacement.',
    steps: [
      'After installation, define support queues and their escalation guidance.',
      'Add tickets with a requester alias, problem description, priority and next step. Link notes to the relevant ticket.',
      'Use the manual review workflow to prepare triage or reply recommendations. A person checks the response and sends it through the appropriate channel.',
    ],
    limitations:
      'There is no inbox sync, SLA clock, customer portal or automatic sending. A note visibility label is stored data, not a customer-facing access-control system. The assistant cannot change tickets or contact customers.',
    questions: [
      {
        question: 'Is this a Zendesk integration or replacement?',
        answer:
          'No. This is an independent Zendesk-style starting point for organizing queues, tickets and notes in TulipFarm. It does not import from or sync with Zendesk.',
      },
      {
        question: 'Does the support assistant send customer replies?',
        answer:
          'No. It prepares read-only recommendations for human review. A person must approve and send any reply through a separate support channel.',
      },
    ],
    related: ['sales-crm', 'product-backlog'],
  },
  'project-tracking': {
    title: 'Project Tracking Package',
    description:
      'Explore an open-source project tracking package for projects, sprints and issues, with a read-only review assistant. A Jira-style starting point for TulipFarm.',
    introduction:
      'The project tracking package connects projects, sprints and issues in TulipFarm. A project defines the goal, a sprint defines its time window and scope, and an issue records the work, acceptance criteria and blockers. The relationships keep delivery reviews tied to the work being discussed.',
    audience:
      'For engineering teams that want an editable starting point for sprint and issue review. Jira-style describes the organization of the work, not an integration or feature-for-feature replacement.',
    steps: [
      'After installation, define a project goal and the owner role responsible for it.',
      'Create sprints with dates and goals, then link issues with status, priority, estimates and acceptance criteria.',
      'Start the manual review workflow to examine scope and blockers. A person decides on priorities and updates the work records.',
    ],
    limitations:
      'The package does not provide a live board, repository integration or Jira sync. Estimates are recorded inputs, not delivery forecasts. The assistant cannot edit issues, commit code or make delivery decisions.',
    questions: [
      {
        question: 'Does the project tracking package sync with Jira or GitHub?',
        answer:
          'No. The package includes project, sprint and issue records plus a review workflow. It does not include Jira sync or a repository integration.',
      },
      {
        question: 'What does the sprint review assistant do?',
        answer:
          'It reads the recorded work, follows the attached procedure, cites evidence and identifies missing information. Its recommendations need human review; it cannot change issues or approve decisions.',
      },
    ],
    related: ['product-backlog', 'leave-management'],
  },
  'product-backlog': {
    title: 'Product Backlog Package',
    description:
      'Explore an open-source product backlog package connecting initiatives, work items and customer feedback, with read-only prioritization review for TulipFarm.',
    introduction:
      'The product backlog package links initiatives, backlog items and customer feedback in TulipFarm. Initiatives describe the desired outcome. Backlog items record the problem, priority, effort estimate and success signal, while feedback records preserve the observed need and limits of the evidence.',
    audience:
      'For product teams who want to discuss priorities with customer evidence close to the work. Its Linear-style structure is an independent starting point, not a connected Linear workspace.',
    steps: [
      'After installation, define an initiative and the customer outcome it should support.',
      'Link backlog items to initiatives, then attach feedback with a source description and evidence limits.',
      'Use the manual review workflow to compare recorded needs and priorities. A person makes the prioritization decision and any roadmap commitment.',
    ],
    limitations:
      'There is no Linear sync or automatic roadmap commitment. The package does not verify customer feedback independently. The read-only assistant suggests actions but cannot reprioritize work or modify records.',
    questions: [
      {
        question: 'Is this package connected to Linear?',
        answer:
          'No. Linear-style describes the backlog workflow. This independent package stores initiatives, backlog items and feedback in TulipFarm without syncing to Linear.',
      },
      {
        question: 'Does the assistant decide product priorities?',
        answer:
          'No. It prepares evidence-based recommendations from the recorded information and marks unknowns. A person decides priorities and makes any roadmap commitments.',
      },
    ],
    related: ['project-tracking', 'marketing-content'],
  },
};

export function getPackageContent(slug: string): PackageContent {
  const content = packageContent[slug];
  if (!content) throw new Error(`Missing package page content: ${slug}`);
  return content;
}
