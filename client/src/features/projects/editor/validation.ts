import type { ProjectDraft } from "./types/projectDraft";

/**
 * Declarative validator for project
 */
export interface ProjectValidationStatus {

  /**
   * Indicates whether the project is valid and can be saved or submitted.
   */
  ok: boolean;

  /**
     * Indicates whether the project can be saved as a draft.
     */
  canSaveDraft: boolean;


  /** name validator */
  name?: string;

  /** rough Idea */
  roughIdea?: string;
  primaryUser?: string;
  coreJob?: string;
  mainProblem?: string;
  mvpOutcome?: string;
  initialProductAreas?: string;
  constraints?: string;

}


type RawDraft = Omit<ProjectDraft, "validation">


const messages = {
  name: {
    required: 'Enter a project name.',
  },
  noNul: 'Remove the NUL character.',
  maxLength: (limit: number) => `Use ${limit} characters or fewer.`,
};


/**
 * Validates a project draft and returns its validation status.
 * @param draft The project draft to validate.
 * @returns The validation status of the project.
 */
export function validateProject(draft: RawDraft): ProjectValidationStatus {


  // runs validation rules
  const validation: Omit<ProjectValidationStatus, "ok" | "canSaveDraft"> = {
    name: validateName(draft.name),
    roughIdea: validateRoughIdea(draft.roughIdea),
    primaryUser: validatePrimaryUser(draft.primaryUser),
    coreJob: validateCoreJob(draft.coreJob),
    mainProblem: validateMainProblem(draft.mainProblem),
    mvpOutcome: validateMvpOutcome(draft.mvpOutcome),
    initialProductAreas: validateInitialProductAreas(draft.initialProductAreas),
    constraints: validateConstraints(draft.constraints),
  }

  const ok = isValid(validation)

  return {
    ok,
    canSaveDraft: ok,
    ...validation
  }
}

function validateName(name: string | undefined) {
  const value = (name ?? '').trim();

  return required(value, messages.name.required)
    ?? noNul(value)
    ?? maxLength(value, 200);
}

function validateRoughIdea(value: string) {
  return noNul(value) ?? maxLength(value, 10000);
}

function validatePrimaryUser(value: string) {
  return noNul(value) ?? maxLength(value, 4000);
}

function validateCoreJob(value: string) {
  return noNul(value) ?? maxLength(value, 4000);
}

function validateMainProblem(value: string) {
  return noNul(value) ?? maxLength(value, 4000);
}

function validateMvpOutcome(value: string) {
  return noNul(value) ?? maxLength(value, 4000);
}

function validateInitialProductAreas(value: string) {
  return noNul(value) ?? maxLength(value, 4000);
}

function validateConstraints(value: string) {
  return noNul(value) ?? maxLength(value, 10000);
}

function required(value: string, message: string) {
  return value ? undefined : message;
}

function noNul(value: string) {
  return value.includes('\0') ? messages.noNul : undefined;
}

function maxLength(value: string, limit: number) {
  return [...value].length > limit ? messages.maxLength(limit) : undefined;
}


function isValid(status: Partial<ProjectValidationStatus>): boolean {
  function check(value: unknown): boolean {
    if (!isRecord(value)) {
      return value === undefined;
    }

    return Object.values(value).every(check);
  }

  return check(status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function revalidateDraft(draft: ProjectDraft) {
  draft.validation = validateProject(draft)
}
