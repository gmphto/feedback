import { CategoryOutlined } from '@mui/icons-material';
import * as React from 'react';

import type { ProjectDraft } from '../../../types/projectDraft';
import type { ProjectUpdate } from '../../../state/reducer';
import { Field, FormRow, controlSx } from '../../../../../../shared/ui/editor/Field';
import { Section } from '../../../../../../shared/ui/editor/Section';
import { Box } from '@mui/material';

interface ProductSectionProps {
  draft: ProjectDraft;
  onUpdate: (update: ProjectUpdate) => void;
  readOnly: boolean;
}

/** Product identity: the plan name and the rough idea that started it. */
export function ProductSection({ draft, onUpdate, readOnly }: ProductSectionProps) {
  return (
    <Section Icon={CategoryOutlined} title="Product">
      <FormRow>
        <Field
          label="Name"
          required
          htmlFor="project-name"
          width={260}
          error={draft.validation?.name}
        >
          <Box
            id="project-name"
            component="input"
            value={draft.name ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ name: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>
      </FormRow>

      <Field label="Rough idea" htmlFor="project-rough-idea" error={draft.validation?.roughIdea}>
        <Box
          id="project-rough-idea"
          component="textarea"
          rows={3}
          value={draft.roughIdea ?? ''}
          disabled={readOnly}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onUpdate({ roughIdea: event.currentTarget.value })
          }
          sx={{ ...controlSx, height: 'auto', py: '5px', resize: 'vertical' }}
        />
      </Field>
    </Section>
  );
}
