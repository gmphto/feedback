import { createSelector } from "@reduxjs/toolkit"
import type { ProjectState } from "../../state/state"
import { getEditorCommands } from "./commands"

type State = { project: ProjectState }

export const selectEditor = ({ project }: State ) => project.editor

export const selectEditorCommands = createSelector(selectEditor, (editor) => 
    getEditorCommands(editor.draft, editor.original, editor.draft?.isReadOnly)
)

export const selectProjectIsEditMode = ({ project }: State) => !project.editor.draft?.isReadOnly && !!project.editor.original

