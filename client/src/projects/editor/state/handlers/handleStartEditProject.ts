import type { Project } from "../../../types/project";
import type { EditorState } from "../state";
import { createProjectDraft } from "./createProjectDraft";

export function handleStartEditProject(
    state: EditorState,
    project: Project,
    readOnlySession: boolean
): EditorState {

    const draft = createProjectDraft(project, readOnlySession)

    return {
        ...state,
        activeKey: project.projectId,
        original: project,
        draft: draft,
        showValidationErrors: false,
    }
}