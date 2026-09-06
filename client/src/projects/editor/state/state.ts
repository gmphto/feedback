import type { Editable } from "../../../shared/util/state"
import type { Project } from "../../types/project";
import type { ProjectValidationStatus } from "../validation";

export interface EditorState extends Editable<Project, ProjectValidationStatus> {

    // This has to own editable values 
    // has to own validation status

    activeKey: number | undefined


}

export const createInitialEditorState = (): EditorState => ({
    /** server persisted values  */
    original: undefined,
    /** editable values */
    draft: undefined,
    /** active Project key */
    activeKey: undefined
})

/**
 * transition methods in a usual domain
 */
// setupProjects(x): y => {}
// createDraftFromX(v: x): y => {}
// convertDraftToApiFormat(x): y => {}
