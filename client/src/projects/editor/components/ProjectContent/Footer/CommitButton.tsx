import Button from "@mui/material/Button"
import { useState } from "react"
import { useAppDispatch } from "../../../../../core/store/hooks"
import { useUpdateProjectMutation } from "../../../../api/api"
import { projectActions } from "../../../../state/slice"
import { useSaveContext } from "../../../hooks/saveContext"
import { ProjectValidationError } from "../../ValidationErrorDialog"

export function CommitButton() {

    const [open, setOpen] = useState(false)

    const [
        updateProject,
        {
            isLoading: isSaving,
            error: saveError,
        },
    ] = useUpdateProjectMutation();

    /** save context */
    const { draftToSave, canSave, showSave, commandText, validateBeforeSave } = useSaveContext()

    const dispatch = useAppDispatch()

    // only show save button if conditions are met
    if (!showSave) return null

    const handleCommit = async () => {
        if (!canSave || isSaving || !draftToSave) return

        // pre-check before commiting
        const ok = await validateBeforeSave()

        if (!ok) {

            return
        }

        if (!ok || draftToSave.projectId === undefined || !draftToSave.name) return

        try {

            // update
            await updateProject({
                projectId: draftToSave.projectId,
                name: draftToSave.name,
                // idea: draftToSave.idea ?? "",
            }).unwrap();

            // close editor
            dispatch(projectActions.stopEditProject())

        } catch {
            // Keep the editor open.
            // saveError contains the RTK Query error.
        }

    }

    const error =
        <>
            {draftToSave && open ?

                <ProjectValidationError draft={draftToSave} onClose={() => setOpen(false)} /> :
                <></>
            }
        </>

    const saveButton = (
        <Button type="button" className="btn btn-success" onClick={handleCommit} disabled={!canSave || isSaving}>
            {isSaving ? "Saving..." : commandText}
        </Button>
    )

    return (

        <>

            {saveButton} {error}

        </>

    )
}
