import type { ProjectDraft } from "../../types/projectDraft";
import type { EditorState } from "../state";
import { createNewDraftProject } from "./createNewDraftProject";

export const handleStartCreateNewProject = (
    state: EditorState,
    readOnlySession: boolean
): EditorState => {

    const draft: ProjectDraft = {
        ...createNewDraftProject(),
    }

    return {
        ...state,
        draft: draft
    }

    // return handleSetActiveProject(
    //     {
    //         ...state,
    //         draft: draft,
    //         original: undefined,
    //     },
    //     readOnlySession
    // )
}