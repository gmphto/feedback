import { AssignmentOutlined, FactCheckOutlined, BarChartOutlined } from '@mui/icons-material';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ActionButton } from '../../../shared/ui/editor/ActionButton';
import { StatusBadge } from '../../../shared/ui/editor/StatusBadge';
import type { Project } from '../types/project';
import type { ProjectUpdate } from './state/reducer';
import { projectActions } from '../state/slice';
import { selectEditor, selectEditorCommands } from './state/selector';
import { ContextPane } from './components/ContextPane/ContextPane';
import { PlanEditorPane } from './components/PlanEditorPane/PlanEditorPane';
import { EditorModuleNav } from './components/shell/EditorModuleNav';
import { EditorShell } from './components/shell/EditorShell';

type EditorModule = 'plan' | 'tasks' | 'reports';

const modules = [
  { value: 'plan' as const, label: 'Plan', Icon: AssignmentOutlined },
  { value: 'tasks' as const, label: 'Tasks', Icon: FactCheckOutlined },
  { value: 'reports' as const, label: 'Reports', Icon: BarChartOutlined },
];

/**
 * The plan editor screen. It reads the editable draft and its command state
 * from the project slice, renders the two-pane workspace and dispatches the
 * pane actions back to the slice. It owns no form state of its own.
 */
export function ProjectEditor() {
  const dispatch = useAppDispatch();
  const { original, draft } = useAppSelector(selectEditor);
  const commands = useAppSelector(selectEditorCommands);
  const projects = useAppSelector((state) => state.project.projects);

  const handleUpdate = React.useCallback(
    (update: ProjectUpdate) => {
      dispatch(projectActions.updateProjectDraft(update));
    },
    [dispatch],
  );

  const handleSelectProject = React.useCallback(
    (project: Project) => {
      dispatch(projectActions.startEdit({ projectToOpen: project, readOnlySession: false }));
    },
    [dispatch],
  );

  const handleClose = React.useCallback(() => {
    dispatch(projectActions.stopEditProject());
  }, [dispatch]);

  const handleAbandon = React.useCallback(() => {
    dispatch(projectActions.cancelCurrentEdits({ readOnlySession: draft?.isReadOnly ?? false }));
  }, [dispatch, draft?.isReadOnly]);

  if (!draft) {
    return null;
  }

  const isPublished = original !== undefined;
  const statusBadge = (
    <StatusBadge tone={isPublished ? 'published' : 'draft'}>
      {isPublished ? 'Published' : 'Draft'}
    </StatusBadge>
  );

  return (
    <EditorShell
      title={draft.name?.trim() ? draft.name : 'Untitled plan'}
      status={statusBadge}
      headerActions={
        <>
          <ActionButton disabled>Split</ActionButton>
          <ActionButton disabled>Remove</ActionButton>
          <ActionButton disabled>Calculate rates</ActionButton>
        </>
      }
      moduleNav={
        <EditorModuleNav<EditorModule>
          items={modules}
          value="plan"
          // Only the plan module is built; the remaining modules stay visible
          // but are not navigable yet.
          onChange={() => undefined}
        />
      }
      primary={
        <PlanEditorPane
          draft={draft}
          statusBadge={statusBadge}
          onUpdate={handleUpdate}
          readOnly={draft.isReadOnly}
          canDelete={isPublished}
          canAbandon={commands.canCancel}
          onDelete={handleAbandon}
          onAbandon={handleAbandon}
          onClose={handleClose}
        />
      }
      secondary={
        <ContextPane
          projects={projects}
          activeProjectId={original?.projectId}
          onSelectProject={handleSelectProject}
        />
      }
    />
  );
}