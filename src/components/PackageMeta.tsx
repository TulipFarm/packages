import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@tulipfarm/sprout/breadcrumb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@tulipfarm/sprout/card';
import ResourceIcon from './ResourceIcon';
import LinkButton from './LinkButton';
import type { CatalogEntry } from '../lib/catalog';

export function PackageBreadcrumb({ title }: { title: string }) {
  return (
    <Breadcrumb className="breadcrumbs">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">All packages</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function PackageInformation({ slug, version, counts }: Pick<CatalogEntry, 'slug' | 'version' | 'counts'>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle render={<h2>For your workspace</h2>} />
        <CardDescription>
          Installation will open in your TulipFarm workspace, where you can review inputs and permissions before
          creating anything.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="resource-counts" aria-label="Package contents">
          {(['table', 'skill', 'agent', 'workflow'] as const)
            .filter(kind => counts[kind] > 0)
            .map(kind => (
              <li key={kind}>
                <ResourceIcon kind={kind} />
                <span>
                  {counts[kind]} {kind}
                  {counts[kind] === 1 ? '' : 's'}
                </span>
              </li>
            ))}
        </ul>
      </CardContent>
      <CardFooter>
        <LinkButton variant="link" href={`https://github.com/TulipFarm/packages/tree/main/packages/${slug}/${version}`}>
          View source on GitHub ↗
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
