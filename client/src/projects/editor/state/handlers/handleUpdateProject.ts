import { revalidateDraft } from "../../validation";
import type { ProjectUpdate } from "../reducer";
import type { EditorState } from "../state";

export function handleUpdateProject(state: EditorState, update: ProjectUpdate) {
    if (!state.draft || state.draft.isReadOnly) {
        return state
    }

    const draft = {
        ...state.draft,
        update
    }

    revalidateDraft(draft)

    return { ...state, draft}
}