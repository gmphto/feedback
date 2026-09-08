import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { selectEditor, selectProjectIsEditMode } from "../../../state/selector";
import { DeleteCancelConfirm, type DeleteCancelResult } from "../../../../../shared/ui/MessageBox";
import { projectActions } from "../../../../state/slice";

export function DeleteButton() {
    const isEditMode = useAppSelector(selectProjectIsEditMode)
    const { original, draft } = useAppSelector(selectEditor)
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch()

    if (!isEditMode || !original) return null

    const content = <p>This will delete project <strong>{draft?.name}</strong>. Please note that this operation is irreversible.</p>

    const title = "Delete project"

    const ok = (ok: DeleteCancelResult) => {
        if (ok) {
            dispatch(projectActions.cancelCurrentEdits({ readOnlySession: draft?.isReadOnly ?? true }))
        }

        setOpen(false)
    }

    return (
        <>

            <button type="button" disabled onClick={() => setOpen(true)}>
                Delete
            </button>

            <DeleteCancelConfirm open={open} title={title} onResult={ok}>
                {content}
            </DeleteCancelConfirm>

        </>

    )
}
