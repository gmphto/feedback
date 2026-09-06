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

}


type RawDraft = Omit<ProjectDraft, "validation"> 


const messages = {
  name: {
    required: "Name is required.",
  }
} 



/**
 * Validates a project draft and returns its validation status.
 * @param draft The project draft to validate.
 * @returns The validation status of the project.
 */
export function validateProject(draft: RawDraft): ProjectValidationStatus {


    // runs validation rules
    const validation: Omit<ProjectValidationStatus, "ok" | "canSaveDraft"> = {
        name: validateName(draft.name)
    }

    const ok = isValid(validation)

    return {
        ok,
        canSaveDraft: ok,
        ...validation
    }
}

function validateName(n: string | undefined) {
    return required(n, messages.name.required)
}

function required(value: unknown, message: string) {
    return value ? undefined : message;
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

