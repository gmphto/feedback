import { Box } from '@mui/material';
import * as React from 'react';

import type { Project } from '../../../types/project';
import { DataGrid, DataGridCell, DataGridRow } from '../../../../../shared/ui/editor/DataGrid';
import type { DataGridColumn } from '../../../../../shared/ui/editor/DataGrid';
import { accent, text } from '../../../../../shared/ui/editor/tokens';

export interface PlanGroup {
  name: string;
  projects: Project[];
}

interface PlanGroupGridProps {
  groups: PlanGroup[];
  /** The plan currently open in the editor, shown as confirmed. */
  activeProjectId?: number;
  onSelect: (project: Project) => void;
}

const columns: DataGridColumn[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'updated', label: 'Updated', align: 'right', width: 80 },
];

/**
 * The grouped plan list shown in the context pane. Groups get a subtle
 * background, an expand/collapse affordance and an inline count; child records
 * are flatter, and the plan already open is confirmed with a green tick rather
 * than a separate column.
 */
export function PlanGroupGrid({ groups, activeProjectId, onSelect }: PlanGroupGridProps) {
  return (
    <DataGrid columns={columns} aria-label="Plans">
      {groups.map((group) => (
        <PlanGroupRows
          key={group.name}
          group={group}
          activeProjectId={activeProjectId}
          onSelect={onSelect}
        />
      ))}
    </DataGrid>
  );
}

interface PlanGroupRowsProps {
  group: PlanGroup;
  activeProjectId?: number;
  onSelect: (project: Project) => void;
}

function PlanGroupRows({ group, activeProjectId, onSelect }: PlanGroupRowsProps) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <>
      <DataGridRow columns={columns} isGroup>
        <DataGridCell
          leading={
            <Box
              component="button"
              type="button"
              aria-label={expanded ? `Collapse ${group.name}` : `Expand ${group.name}`}
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 14,
                height: 14,
                p: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: text.secondary,
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              {expanded ? '▾' : '▸'}
            </Box>
          }
        >
          {group.name} <span style={{ color: text.secondary }}>({group.projects.length})</span>
        </DataGridCell>
        <DataGridCell align="right" />
      </DataGridRow>

      {expanded
        ? group.projects.map((project) => {
            const isActive = project.projectId !== undefined && project.projectId === activeProjectId;

            return (
              <DataGridRow
                key={project.projectId ?? `${project.name}-${project.createdOn}`}
                columns={columns}
                selected={isActive}
              >
                <DataGridCell
                  leading={
                    <Box
                      component="input"
                      type="checkbox"
                      checked={isActive}
                      onChange={() => onSelect(project)}
                      aria-label={`Open ${project.name ?? 'plan'}`}
                      sx={{ m: 0, cursor: 'pointer' }}
                    />
                  }
                  indent={12}
                  markerColor={isActive ? accent.green : accent.blue}
                  confirmed={isActive}
                >
                  {project.name || 'Untitled plan'}
                </DataGridCell>
                <DataGridCell align="right">{formatCompactDate(project.updatedOn ?? project.createdOn)}</DataGridCell>
              </DataGridRow>
            );
          })
        : null}
    </>
  );
}

function formatCompactDate(value: string | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}
