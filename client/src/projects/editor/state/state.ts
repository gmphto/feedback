import type { Editable } from "../../../shared/util/state"
import type { ProjectDraft } from "../../fields"

export interface EditorState extends Editable<ProjectDraft & { id: number; version: number }, ProjectDraft> {

    // This has to own editable values 
    // has to own validation status

    activeKey: number | undefined

    /**
     * Persistance server state record
     */
    original: (ProjectDraft & { id: number; version: number }) | undefined

    /**
     * Editable values
     */
    draft: ProjectDraft | undefined

}

/**
 * transition methods in a usual domain
 */
// setupProjects(x): y => {}
// createDraftFromX(v: x): y => {}
// convertDraftToApiFormat(x): y => {}
