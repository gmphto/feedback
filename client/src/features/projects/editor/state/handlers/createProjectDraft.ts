import type { Project } from "../../../types/project";
import type { ProjectDraft } from "../../types/projectDraft";
import { validateProject } from "../../validation";

export function createProjectDraft(project: Project, readOnlySession: boolean): ProjectDraft {
    let draft: ProjectDraft = {
        ...project,
        validation: undefined,
        
        hasChanged: false,
        isNew: false,

        isReadOnly: false
    }

    if(readOnlySession) {
        draft.isReadOnly = true
    }

    draft = {
        ...draft,
        validation: validateProject(draft)
    }

    return draft;
}