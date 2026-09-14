import { HistoryOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';

import type { ProjectDraft } from '../../../types/projectDraft';
import { DataGrid, DataGridCell, DataGridRow } from '../../../../../../shared/ui/editor/DataGrid';
import type { DataGridColumn } from '../../../../../../shared/ui/editor/DataGrid';
import { Section } from '../../../../../../shared/ui/editor/Section';
import { text } from '../../../../../../shared/ui/editor/tokens';

interface HistorySectionProps {
  draft: ProjectDraft;
}

const columns: DataGridColumn[] = [
  { key: 'event', label: 'Event' },
  { key: 'when', label: 'When', align: 'right', width: 160 },
];

/** A read-only audit trail for the plan. New drafts have no history yet. */
export function HistorySection({ draft }: HistorySectionProps) {
  const rows = buildHistoryRows(draft);

  return (
    <Section Icon={HistoryOutlined} title="History">
      {rows.length === 0 ? (
        <Box component="p" sx={{ m: 0, fontSize: 11, color: text.disabled, fontStyle: 'italic' }}>
          No history yet.
        </Box>
      ) : (
        <DataGrid columns={columns} aria-label="Plan history">
          {rows.map((row) => (
            <DataGridRow key={row.event + row.when} columns={columns}>
              <DataGridCell>{row.event}</DataGridCell>
              <DataGridCell align="right">{row.when}</DataGridCell>
            </DataGridRow>
          ))}
        </DataGrid>
      )}
    </Section>
  );
}

interface HistoryRow {
  event: string;
  when: string;
}

function buildHistoryRows(draft: ProjectDraft): HistoryRow[] {
  const rows: HistoryRow[] = [];

  if (draft.createdOn) {
    rows.push({ event: 'Created', when: formatTimestamp(draft.createdOn) });
  }

  if (draft.updatedOn) {
    rows.push({ event: 'Updated', when: formatTimestamp(draft.updatedOn) });
  }

  return rows;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 16).replace('T', ' ');
}
