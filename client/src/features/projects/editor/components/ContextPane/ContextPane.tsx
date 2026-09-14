import { MapOutlined, ViewListOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import * as React from 'react';

import type { Project } from '../../../types/project';
import type { ProjectGroupingType } from '../../../dashboard/types';
import { ContextTabs } from '../../../../../shared/ui/editor/ContextTabs';
import type { TabItem } from '../../../../../shared/ui/editor/ContextTabs';
import { EditorPane } from '../shell/EditorPane';
import { PaneHeader } from '../../../../../shared/ui/editor/PaneHeader';
import { Toolbar } from '../../../../../shared/ui/editor/Toolbar';
import { text, typeScale } from '../../../../../shared/ui/editor/tokens';
import { PlanGroupGrid } from './PlanGroupGrid';
import type { PlanGroup } from './PlanGroupGrid';

export type ContextView = 'list' | 'map';

const viewTabs: TabItem<ContextView>[] = [
  { value: 'list', label: 'List', Icon: ViewListOutlined },
  { value: 'map', label: 'Map', Icon: MapOutlined },
];

interface ContextPaneProps {
  projects: Project[];
  /** The plan currently open in the editor. */
  activeProjectId?: number;
  onSelectProject: (project: Project) => void;
}

/**
 * The supporting context pane: a list/map view switch, a filter toolbar and the
 * grouped set of plans. It is lookup and selection only; editing lives in the
 * primary pane.
 */
export function ContextPane({ projects, activeProjectId, onSelectProject }: ContextPaneProps) {
  const [view, setView] = React.useState<ContextView>('list');
  const [filter, setFilter] = React.useState('');
  const [autoHideFields, setAutoHideFields] = React.useState(false);
  const [grouping, setGrouping] = React.useState<ProjectGroupingType>('name');

  const groups = React.useMemo(
    () => groupPlans(projects, grouping, filter),
    [projects, grouping, filter],
  );

  return (
    <EditorPane
      header={
        <>
          <PaneHeader
            title="Plans"
            meta={`${projects.length}`}
            actions={
              <ContextTabs
                items={viewTabs}
                value={view}
                onChange={setView}
                variant="secondary"
                aria-label="Plan views"
              />
            }
          />
          <Toolbar
            filterValue={filter}
            onFilterChange={setFilter}
            filterPlaceholder="Filter"
          >
            <AutoHideFieldsToggle checked={autoHideFields} onChange={setAutoHideFields} />

            <GroupBySelect value={grouping} onChange={setGrouping} />
          </Toolbar>
        </>
      }
    >
      {view === 'list' ? (
        groups.length > 0 ? (
          <PlanGroupGrid
            groups={groups}
            activeProjectId={activeProjectId}
            onSelect={onSelectProject}
          />
        ) : (
          <Typography sx={{ fontSize: typeScale.body, color: text.disabled, py: 2 }}>
            No plans match the current filter.
          </Typography>
        )
      ) : (
        <Typography sx={{ fontSize: typeScale.body, color: text.secondary, py: 2 }}>
          Map view is not available for this workspace.
        </Typography>
      )}
    </EditorPane>
  );
}

interface AutoHideFieldsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Compact inline checkbox used as a toolbar configuration control. */
function AutoHideFieldsToggle({ checked, onChange }: AutoHideFieldsToggleProps) {
  return (
    <Box
      component="label"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: typeScale.meta,
        color: text.secondary,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      <Box
        component="input"
        type="checkbox"
        checked={checked}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.currentTarget.checked)
        }
        sx={{ m: 0, cursor: 'pointer' }}
      />
      Auto-hide fields
    </Box>
  );
}

interface GroupBySelectProps {
  value: ProjectGroupingType;
  onChange: (value: ProjectGroupingType) => void;
}

/** Native select so the toolbar control stays small and inline. */
function GroupBySelect({ value, onChange }: GroupBySelectProps) {
  return (
    <Box
      component="label"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: typeScale.meta,
        color: text.secondary,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      Group by
      <Box
        component="select"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onChange(event.currentTarget.value as ProjectGroupingType)
        }
        sx={{
          height: 24,
          px: '4px',
          border: '1px solid #D8DDE0',
          borderRadius: '2px',
          backgroundColor: '#fff',
          color: text.primary,
          fontSize: typeScale.meta,
        }}
      >
        <option value="name">Name</option>
        <option value="date">Date</option>
      </Box>
    </Box>
  );
}

/** Groups plans by their first letter (name) or their year (date). */
export function groupPlans(
  projects: Project[],
  grouping: ProjectGroupingType,
  filter: string,
): PlanGroup[] {
  const normalizedFilter = filter.trim().toLowerCase();
  const filtered = normalizedFilter
    ? projects.filter((project) => (project.name ?? '').toLowerCase().includes(normalizedFilter))
    : projects;

  if (grouping === 'date') {
    return groupByDate(filtered);
  }

  return groupByName(filtered);
}

function groupByName(projects: Project[]): PlanGroup[] {
  const groups = new Map<string, Project[]>();

  for (const project of projects) {
    const key = Array.from(project.name?.trim() ?? '')[0]?.toUpperCase() ?? '#';
    const bucket = groups.get(key) ?? [];
    bucket.push(project);
    groups.set(key, bucket);
  }

  return Array.from(groups, ([name, grouped]) => ({ name, projects: sortByName(grouped) })).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function sortByName(projects: Project[]): Project[] {
  return [...projects].sort((left, right) =>
    (left.name ?? '').toLowerCase().localeCompare((right.name ?? '').toLowerCase()),
  );
}

function groupByDate(projects: Project[]): PlanGroup[] {
  const groups = new Map<string, Project[]>();

  for (const project of projects) {
    const timestamp = Date.parse(project.updatedOn ?? project.createdOn ?? '');
    const key = Number.isFinite(timestamp)
      ? String(new Date(timestamp).getFullYear())
      : 'No date';
    const bucket = groups.get(key) ?? [];
    bucket.push(project);
    groups.set(key, bucket);
  }

  return Array.from(groups, ([name, grouped]) => ({ name, projects: grouped }));
}
