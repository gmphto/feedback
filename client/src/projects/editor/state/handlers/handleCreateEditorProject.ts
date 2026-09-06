import type { Project } from "../../../types/project";
import { createProjectDraft } from "./createProjectDraft";

export function handleCreateEditorProject(
    project:Project,
    readOnlySession: boolean
) {

    const draft = createProjectDraft(project, readOnlySession)

    return {
        original: project,
        draft,
    }
}