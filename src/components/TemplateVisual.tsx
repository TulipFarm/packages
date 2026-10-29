import ResourceIcon from './ResourceIcon';
import { Badge } from '@tulipfarm/sprout/badge';
import { Table } from '@tulipfarm/sprout/table';
import { Card, CardHeader, CardTitle, CardFooter } from '@tulipfarm/sprout/card';
import type { TemplateVisualData } from '../lib/presentation';

export default function TemplateVisual({ data, large = false }: { data: TemplateVisualData; large?: boolean }) {
  return (
    <div className={`template-visual${large ? ' template-visual-large' : ''}`} aria-label="Package content preview">
      <Card size={large ? 'md' : 'sm'} className="preview-sheet">
        <CardHeader>
          <div className="preview-title">
            <CardTitle>
              <span className="preview-title-label">
                <ResourceIcon kind="table" />
                {data.title}
              </span>
            </CardTitle>
            <span className="preview-caption">Example data</span>
          </div>
        </CardHeader>
        {data.layout === 'board' ? (
          <div className="preview-board">
            {data.rows.map(row => (
              <div className="preview-record" key={row.key}>
                {row.status && <Badge variant="outline">{row.status}</Badge>}
                <span className="preview-record-title">{row.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <Table
            aria-label={`${data.title} example records`}
            data={data.rows}
            getRowId={row => row.key}
            columns={[
              { key: 'title', header: data.fields[0] ?? 'Record' },
              {
                key: 'status',
                header: data.statusLabel,
                cell: row => row.status && <Badge variant="outline">{row.status}</Badge>,
              },
            ]}
            variant="plain"
            narrow="stack"
          />
        )}
        {large && (
          <CardFooter>
            <div className="preview-fields">
              {data.fields.map(field => (
                <span key={field}>{field}</span>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
      {large && (
        <div className="preview-table-list">
          {data.tables.map(table => (
            <span key={table}>
              <ResourceIcon kind="table" /> {table}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
