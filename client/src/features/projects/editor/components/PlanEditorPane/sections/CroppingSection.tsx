import { AgricultureOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import * as React from 'react';

import type { ProjectDraft } from '../../../types/projectDraft';
import type { ProjectUpdate } from '../../../state/reducer';
import { Field, FormGrid, controlSx } from '../../../../../../shared/ui/editor/Field';
import { Section } from '../../../../../../shared/ui/editor/Section';

interface CroppingSectionProps {
  draft: ProjectDraft;
  onUpdate: (update: ProjectUpdate) => void;
  readOnly: boolean;
}

/** The cropping context: who the product serves and what job it does. */
export function CroppingSection({ draft, onUpdate, readOnly }: CroppingSectionProps) {
  return (
    <Section Icon={AgricultureOutlined} title="Cropping">
      <FormGrid columns="repeat(auto-fit, minmax(200px, 1fr))">
        <Field label="Primary user" htmlFor="project-primary-user" error={draft.validation?.primaryUser}>
          <Box
            id="project-primary-user"
            component="input"
            value={draft.primaryUser ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ primaryUser: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>

        <Field label="Core job" htmlFor="project-core-job" error={draft.validation?.coreJob}>
          <Box
            id="project-core-job"
            component="input"
            value={draft.coreJob ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ coreJob: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>

        <Field label="Main problem" htmlFor="project-main-problem" error={draft.validation?.mainProblem}>
          <Box
            id="project-main-problem"
            component="input"
            value={draft.mainProblem ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ mainProblem: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>

        <Field label="MVP outcome" htmlFor="project-mvp-outcome" error={draft.validation?.mvpOutcome}>
          <Box
            id="project-mvp-outcome"
            component="input"
            value={draft.mvpOutcome ?? ''}
            disabled={readOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ mvpOutcome: event.currentTarget.value })
            }
            sx={controlSx}
          />
        </Field>
      </FormGrid>
    </Section>
  );
}
