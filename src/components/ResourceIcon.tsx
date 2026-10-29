import { Database } from 'reicon-react/icons/Database';
import { BookOpen } from 'reicon-react/icons/BookOpen';
import { Users } from 'reicon-react/icons/Users';
import { BranchDown } from 'reicon-react/icons/BranchDown';
import { AddCircle } from 'reicon-react/icons/AddCircle';
import { Files } from 'reicon-react/icons/Files';
import { Plug } from 'reicon-react/icons/Plug';

export const resourceTypes = {
  table: { Icon: Database, label: 'Table' },
  skill: { Icon: BookOpen, label: 'Skill' },
  agent: { Icon: Users, label: 'Agent' },
  workflow: { Icon: BranchDown, label: 'Workflow' },
  'seed-row': { Icon: AddCircle, label: 'Starter record' },
  integration: { Icon: Plug, label: 'Integration' },
  file: { Icon: Files, label: 'File' },
};

export type ResourceKind = keyof typeof resourceTypes;

export default function ResourceIcon({ kind }: { kind: ResourceKind }) {
  const { Icon } = resourceTypes[kind];
  return <Icon size={18} aria-hidden="true" />;
}
