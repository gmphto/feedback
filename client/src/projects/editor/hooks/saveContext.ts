import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import { projectActions } from "../../state/slice";
import { showProjectValidationDialog } from "../components/ValidationErrorDialog";
import { selectEditorCommands } from "../state/selector";

export function useSaveContext() {
    const dispatch = useAppDispatch()

    const { save } = useAppSelector(selectEditorCommands)

    const readOnly = useAppSelector((state) => state.project.editor.draft?.isReadOnly)

    const showValidationErrors = useAppSelector((state) => state.project.editor.showValidationErrors)

    return useMemo(() => {

        return {

                draftToSave: save.draft,
                canSave: save.canSave,
                showSave: save.showSave,
                commandText: save.commandText,
                validateBeforeSave,

        }

        async function validateBeforeSave() {


            if (!save.draft || readOnly) {

                return false

            }

            if (save.draft.validation?.canSaveDraft) {

                return true

            }

            if (!showValidationErrors) {

                dispatch(projectActions.setShowValidationErrors(true))

            }

            await showProjectValidationDialog(save.draft)

            return false

        }
    }, [dispatch, readOnly, save, showValidationErrors])
}
