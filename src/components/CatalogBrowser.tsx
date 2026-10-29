import { useState } from 'react';
import { Button } from '@tulipfarm/sprout/button';
import { Label } from '@tulipfarm/sprout/label';
import { Badge } from '@tulipfarm/sprout/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@tulipfarm/sprout/card';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@tulipfarm/sprout/input-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@tulipfarm/sprout/select';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@tulipfarm/sprout/sidebar';
import Search from 'reicon-react/icons/Search';
import Grid2 from 'reicon-react/icons/Grid2';
import Folder from 'reicon-react/icons/Folder';
import Code from 'reicon-react/icons/Code';
import BookOpen from 'reicon-react/icons/BookOpen';
import ArrowUpRight from 'reicon-react/icons/ArrowUpRight';
import SidebarLeft from 'reicon-react/icons/SidebarLeft';
import TemplateIdentity, { styleLabel } from './TemplateIdentity';
import ResourceIcon from './ResourceIcon';
import TemplateArtwork from './TemplateArtwork';
import ThemeToggle from './ThemeToggle';
import type { presentTemplate } from '../lib/presentation';

export interface CatalogCard {
  slug: string;
  version: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  detailPath: string;
  counts: Record<string, number>;
  presentation: ReturnType<typeof presentTemplate>;
}

function TemplateCard({ entry }: { entry: CatalogCard }) {
  return (
    <Card className="market-card" render={<article />}>
      <CardContent>
        <TemplateArtwork slug={entry.slug} data={entry.presentation.visual} />
      </CardContent>
      <CardHeader>
        <CardTitle
          render={
            <h3>
              <a href={entry.detailPath}>{entry.title}</a>
            </h3>
          }
        />
        <CardDescription>{entry.presentation.outcome}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="resource-counts" aria-label="Package contents">
          {(['table', 'skill', 'agent', 'workflow'] as const)
            .filter(kind => entry.counts[kind] > 0)
            .map(kind => (
              <li key={kind}>
                <ResourceIcon kind={kind} />
                <span>
                  {entry.counts[kind]} {kind}
                  {entry.counts[kind] === 1 ? '' : 's'}
                </span>
              </li>
            ))}
        </ul>
      </CardContent>
      <CardContent className="market-card-bottom">
        <div className="market-publisher">
          {entry.presentation.brand ? (
            <>
              <TemplateIdentity slug={entry.slug} brand={entry.presentation.brand} />
              <div>
                <span>{styleLabel(entry.presentation.brand).replace(' starter', '')}</span>
                <small>Not affiliated</small>
              </div>
            </>
          ) : (
            <span>{entry.category}</span>
          )}
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href={entry.detailPath} aria-label={`Preview ${entry.title}`} />}
        >
          See preview
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CatalogBrowser({ entries }: { entries: CatalogCard[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('az');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const categories = [...new Set(entries.map(entry => entry.category))].sort();
  const reset = () => {
    setQuery('');
    setCategory('All categories');
    setNavigationOpen(false);
  };
  const matches = entries
    .filter(entry => {
      const text =
        `${entry.title} ${entry.description} ${entry.presentation.outcome} ${entry.category} ${entry.tags.join(' ')}`.toLowerCase();
      return (
        (category === 'All categories' || entry.category === category) && text.includes(query.trim().toLowerCase())
      );
    })
    .sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
  const browsing = category === 'All categories' && !query.trim();
  const shelves = browsing
    ? [
        {
          title: 'For your team',
          entries: matches.filter(entry => ['HR', 'Sales', 'Support'].includes(entry.category)),
        },
        {
          title: 'For product & content',
          entries: matches.filter(entry => !['HR', 'Sales', 'Support'].includes(entry.category)),
        },
      ]
    : [{ title: category === 'All categories' ? 'Search results' : `${category} packages`, entries: matches }];

  return (
    <SidebarProvider
      className="market-shell"
      keyboardShortcut={false}
      openMobile={navigationOpen}
      onOpenMobileChange={setNavigationOpen}
    >
      <Sidebar collapsible="offcanvas" className="market-sidebar" label="Packages">
        <SidebarHeader>
          <a className="wordmark" href="/" aria-label="TulipFarm Packages home">
            <img src="/favicon.svg" width="28" height="28" alt="" />
            <span className="brand-name">
              TulipFarm <span className="brand-product">Packages</span>
            </span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>EXPLORE</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton icon={<Grid2 size={18} />} isActive={browsing} onClick={reset}>
                  All packages
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>CATEGORIES</SidebarGroupLabel>
            <SidebarMenu>
              {categories.map(item => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton
                    icon={<Folder size={18} />}
                    badge={entries.filter(entry => entry.category === item).length}
                    isActive={category === item}
                    aria-pressed={category === item}
                    onClick={() => {
                      setCategory(item);
                      setNavigationOpen(false);
                    }}
                  >
                    {item}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>RESOURCES</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  nativeButton={false}
                  icon={<BookOpen size={18} />}
                  render={<a href="#how-it-works" aria-label="How packages work" />}
                >
                  How packages work
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  nativeButton={false}
                  icon={<Code size={18} />}
                  render={<a href="https://tulipfarm.ai/schemas/system-package.v1.json" aria-label="Package schema" />}
                >
                  Package schema
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  nativeButton={false}
                  icon={<Code size={18} />}
                  render={<a href="/catalog.json" aria-label="JSON catalog" />}
                >
                  JSON catalog
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="market-sidebar-note">
            <span>Open source. Yours to build.</span>
            <p>No account needed. MIT licensed.</p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="market-main">
        <header className="market-topbar">
          <div className="market-location">
            <SidebarTrigger aria-label="Toggle package navigation">
              <SidebarLeft size={20} aria-hidden="true" />
            </SidebarTrigger>
            <span className="market-location-parent">Explore</span>
            <span aria-hidden="true">/</span>
            <strong>Packages</strong>
          </div>
          <div className="market-topbar-actions">
            <Button
              nativeButton={false}
              variant="ghost"
              render={<a href="https://github.com/TulipFarm/packages" aria-label="GitHub" />}
            >
              GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <div className="market-content">
          <div className="market-section-nav">
            <span className="market-current">
              <Grid2 size={16} aria-hidden="true" /> Package library
            </span>
            <Badge variant="outline">Open source</Badge>
          </div>
          <section className="market-banner" aria-labelledby="market-heading">
            <img
              className="banner-mark banner-mark-left"
              src="/favicon.svg"
              alt=""
              aria-hidden="true"
              width="224"
              height="224"
            />
            <img
              className="banner-mark banner-mark-right"
              src="/favicon.svg"
              alt=""
              aria-hidden="true"
              width="224"
              height="224"
            />
            <h1 id="market-heading">
              Build your next system with
              <br />
              <span>ready-to-use</span> packages
            </h1>
            <div className="market-search">
              <Label htmlFor="package-search" className="sr-only">
                Search packages
              </Label>
              <InputGroup size="lg">
                <InputGroupInput
                  id="package-search"
                  type="search"
                  placeholder="Search packages, teams or use cases..."
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Search size={20} aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </section>
          <div className="market-filters">
            <Select
              items={[
                { value: 'az', label: 'Name A–Z' },
                { value: 'za', label: 'Name Z–A' },
              ]}
              value={sort}
              onValueChange={value => {
                if (value) setSort(value);
              }}
            >
              <SelectTrigger aria-label="Sort packages">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">Name A–Z</SelectItem>
                <SelectItem value="za">Name Z–A</SelectItem>
              </SelectContent>
            </Select>
            <Select
              items={['All categories', ...categories].map(item => ({ value: item, label: item }))}
              value={category}
              onValueChange={value => {
                if (value) setCategory(value);
              }}
            >
              <SelectTrigger aria-label="Filter by category">
                <Grid2 size={16} aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['All categories', ...categories].map(item => (
                  <SelectItem value={item} key={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!browsing && (
              <Button variant="ghost" onClick={reset}>
                Clear filters
              </Button>
            )}
            <output className="market-result-count" aria-live="polite">
              {matches.length} {matches.length === 1 ? 'package' : 'packages'}
            </output>
          </div>
          <noscript>
            <p className="notice">All packages are listed below. Search and filters need JavaScript.</p>
          </noscript>
          <div className="market-shelves">
            {shelves
              .filter(shelf => shelf.entries.length > 0)
              .map(shelf => (
                <section className="market-shelf" key={shelf.title} aria-label={shelf.title}>
                  <h2>{shelf.title}</h2>
                  <div className="market-grid">
                    {shelf.entries.map(entry => (
                      <TemplateCard entry={entry} key={`${entry.slug}/${entry.version}`} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
          {matches.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle render={<h2>No packages match that search.</h2>} />
                <CardDescription>
                  Try a team name like sales, or clear the filters to see every package.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={reset}>
                  Show all packages
                </Button>
              </CardContent>
            </Card>
          )}
          <p className="catalog-disclaimer">
            Jira, Linear and Zendesk marks identify workflow styles, not integrations or endorsements. These starters
            are not full replacements.
          </p>
          <section className="market-how" id="how-it-works">
            <h2>A starting point. Not a black box.</h2>
            <p>Every package includes tables, skills, agents and workflows in one open-source JSON file.</p>
            <ol>
              <li>
                <strong>Look inside.</strong> Explore what is included and preview the example records.
              </li>
              <li>
                <strong>Install to your workspace.</strong> An install link will take you to TulipFarm.
              </li>
              <li>
                <strong>Review, then build.</strong> Confirm inputs and permissions in your workspace before creating
                anything.
              </li>
            </ol>
            <p className="small">Install links are not available yet. You can browse every package in the meantime.</p>
          </section>
        </div>
      </div>
    </SidebarProvider>
  );
}
