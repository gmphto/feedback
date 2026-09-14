import { AppsOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import * as React from 'react';

import type { ProjectDraft } from '../../../types/projectDraft';
import type { ProjectUpdate } from '../../../state/reducer';
import { Field, FormGrid, controlSx } from '../../../../../../shared/ui/editor/Field';
import { Section } from '../../../../../../shared/ui/editor/Section';

interface ApplicationsSectionProps {
  draft: ProjectDraft;
  onUpdate: (update: ProjectUpdate) => void;
  readOnly: boolean;
}

/** Where the product is applied and the constraints around it. */
export function ApplicationsSection({ draft, onUpdate, readOnly }: ApplicationsSectionProps) {
  return (
    <Section Icon={AppsOutlined} title="Applications">
      <FormGrid columns="repeat(auto-fit, minmax(220px, 1fr))">
        <Field
          label="Initial product areas"
          htmlFor="project-initial-product-areas"
          error={draft.validation?.initialProductAreas}
        >
          <Box
            id="project-initial-product-areas"
            component="input"
            value={draft.initialProductAreas ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ initialProductAreas: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>
      </FormGrid>

      <Field label="Constraints" htmlFor="project-constraints" error={draft.validation?.constraints}>
        <Box
          id="project-constraints"
          component="textarea"
          rows={2}
          value={draft.constraints ?? ''}
          disabled={readOnly}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onUpdate({ constraints: event.currentTarget.value })
          }
          sx={{ ...controlSx, height: 'auto', py: '5px', resize: 'vertical' }}
        />
      </Field>
    </Section>
  );
}
