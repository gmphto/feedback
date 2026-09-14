import { AppsOutlined, CategoryOutlined, AgricultureOutlined, HistoryOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import * as React from 'react';

import type { ProjectDraft } from '../../types/projectDraft';
import type { ProjectUpdate } from '../../state/reducer';
import { ContextTabs } from '../../../../../shared/ui/editor/ContextTabs';
import type { TabItem } from '../../../../../shared/ui/editor/ContextTabs';
import { AlertBanner } from '../../../../../shared/ui/editor/AlertBanner';
import { EditorPane } from '../shell/EditorPane';
import { PaneHeader } from '../../../../../shared/ui/editor/PaneHeader';
import { ActionButton } from '../../../../../shared/ui/editor/ActionButton';
import { ApplicationsSection } from './sections/ApplicationsSection';
import { CroppingSection } from './sections/CroppingSection';
import { HistorySection } from './sections/HistorySection';
import { ProductSection } from './sections/ProductSection';

export type PlanTab = 'products' | 'cropping' | 'applications' | 'history';

const tabs: TabItem<PlanTab>[] = [
  { value: 'products', label: 'Products', Icon: CategoryOutlined },
  { value: 'cropping', label: 'Cropping', Icon: AgricultureOutlined },
  { value: 'applications', label: 'Applications', Icon: AppsOutlined },
  { value: 'history', label: 'History', Icon: HistoryOutlined },
];

interface PlanEditorPaneProps {
  draft: ProjectDraft;
  /** Inline status badge for the pane header. */
  statusBadge: React.ReactNode;
  onUpdate: (update: ProjectUpdate) => void;
  readOnly: boolean;
  /** Whether the plan has a saved original it could be deleted from. */
  canDelete: boolean;
  /** Whether there are unsaved edits that can be abandoned. */
  canAbandon: boolean;
  onDelete: () => void;
  onAbandon: () => void;
  onClose: () => void;
}

/**
 * The primary task pane: the editable definition of the plan grouped into
 * contextual tabs, with the pane's actions pinned to the bottom bar.
 */
export function PlanEditorPane({
  draft,
  statusBadge,
  onUpdate,
  readOnly,
  canDelete,
  canAbandon,
  onDelete,
  onAbandon,
  onClose,
}: PlanEditorPaneProps) {
  const [activeTab, setActiveTab] = React.useState<PlanTab>('products');

  const validationMessages = collectValidationMessages(draft);

  return (
    <EditorPane
      header={
        <>
          <PaneHeader
            leading={statusBadge}
            title={draft.name?.trim() ? draft.name : 'Untitled plan'}
            meta={readOnly ? 'Read only' : undefined}
          />
          <ContextTabs
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            aria-label="Plan sections"
          />
        </>
      }
      footer={
        <>
          <ActionButton tone="destructive" onClick={onDelete} disabled={!canDelete}>
            Delete plan
          </ActionButton>
          <ActionButton tone="destructive" onClick={onAbandon} disabled={!canAbandon}>
            Abandon plan
          </ActionButton>

          <ActionButton tone="secondary" disabled>
            Report
          </ActionButton>

          <Box sx={{ ml: 'auto' }} />

          <ActionButton tone="primary" onClick={onClose}>
            Close
          </ActionButton>
        </>
      }
    >
      {!readOnly && validationMessages.length > 0 ? (
        <AlertBanner tone="warning">{validationMessages.join(' ')}</AlertBanner>
      ) : null}

      {activeTab === 'products' ? (
        <ProductSection draft={draft} onUpdate={onUpdate} readOnly={readOnly} />
      ) : null}
      {activeTab === 'cropping' ? (
        <CroppingSection draft={draft} onUpdate={onUpdate} readOnly={readOnly} />
      ) : null}
      {activeTab === 'applications' ? (
        <ApplicationsSection draft={draft} onUpdate={onUpdate} readOnly={readOnly} />
      ) : null}
      {activeTab === 'history' ? <HistorySection draft={draft} /> : null}
    </EditorPane>
  );
}

/**
 * Field-level validation messages for the draft. The alert near the top of the
 * pane is the persistent surface for this state; saving never depends on a
 * modal dialog to explain what is wrong.
 */
function collectValidationMessages(draft: ProjectDraft): string[] {
  const validation = draft.validation;

  if (!validation) {
    return [];
  }

  return Object.values(validation).filter(
    (message): message is string => typeof message === 'string',
  );
}
