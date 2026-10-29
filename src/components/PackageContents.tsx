import ResourceIcon from './ResourceIcon';
import type { CatalogEntry, ResourceKind } from '../lib/catalog';

const groups: { kind: ResourceKind; title: string }[] = [
  { kind: 'table', title: 'Tables' },
  { kind: 'skill', title: 'Skills' },
  { kind: 'agent', title: 'Agents' },
  { kind: 'workflow', title: 'Workflows' },
  { kind: 'integration', title: 'Integrations' },
  { kind: 'file', title: 'Files' },
  { kind: 'seed-row', title: 'Example records' },
];

export default function PackageContents({ resources }: Pick<CatalogEntry, 'resources'>) {
  return (
    <div className="package-contents">
      {groups.map(group => {
        const items = resources.filter(resource => resource.kind === group.kind);
        if (!items.length) return null;
        return (
          <section className="contents-group" key={group.kind} aria-labelledby={`contents-${group.kind}`}>
            <h3 id={`contents-${group.kind}`}>
              <ResourceIcon kind={group.kind} />
              {group.title}
              <span>{items.length}</span>
            </h3>
            <ul>
              {items.map(resource => (
                <li key={resource.key}>
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
