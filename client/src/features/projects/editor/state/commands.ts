import type { Project } from "../../types/project";
import type { ProjectDraft } from "../types/projectDraft";

export function getEditorCommands(
    draft: ProjectDraft | undefined,
    original: Project | undefined,
    readOnly: boolean | undefined
) {
    
    const hasChanges = !readOnly && !!draft && (!original || !areEqual(draft, original))


    return {

        canCancel: hasChanges,
        canClose: !hasChanges,
        save: {

            draft,
            canSave: hasChanges,
            showSave: !readOnly && !!draft,
            commandText: original ? "Save changes" : "Save project"

        }

    }

}

function areEqual(draft: ProjectDraft, original: Project) {
    return draft.projectId === original.projectId
        && draft.name === original.name
        && draft.projectNumber === original.projectNumber
        && draft.idea === original.idea
        && draft.job === original.job
        && draft.problem === original.problem
        && draft.mvpOutcome === original.mvpOutcome
        && draft.initialProductAreas === original.initialProductAreas
        && draft.constraints === original.constraints
        && draft.createdOn === original.createdOn
        && draft.updatedOn === original.updatedOn
        && draft.createdBy === original.createdBy
        && draft.updatedBy === original.updatedBy;
}
