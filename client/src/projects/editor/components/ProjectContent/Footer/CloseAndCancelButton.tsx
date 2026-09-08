import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { selectEditor, selectEditorCommands, selectProjectIsEditMode } from "../../../state/selector";
import { OkCancelConfirm, type OkCancelResult } from "../../../../../shared/ui/MessageBox";
import { projectActions } from "../../../../state/slice";
import { Button } from "@mui/material";

export function CloseOrCancelButton() {
    const { canClose, canCancel } = useAppSelector(selectEditorCommands);

    return canCancel ? <CancelButton /> : <CloseButton canClose={canClose} />
}

export function CancelButton() {
    const isEditMode = useAppSelector(selectProjectIsEditMode)
    const { original, draft } = useAppSelector(selectEditor)
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch()

    if (!isEditMode || !original) return null

    const content = <p>All changes made to this project will be cancelled, and it will be removed from the editor</p>

    const title = "Cancel changes"

    const ok = (ok: OkCancelResult) => {
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

            <OkCancelConfirm open={open} title={title} onResult={ok}>
                {content}
            </OkCancelConfirm>

        </>

    )
}


export function CloseButton({ canClose }: { canClose: boolean }) {

    const dispatch = useAppDispatch()

    const close = () => dispatch(projectActions.stopEditProject())

    return (

        <Button
            type="button"
            className="btn btn-primary"
            onClick={close}
            disabled={!canClose}
            title="Close project editor"
        >
            Close
        </Button>

    )
}