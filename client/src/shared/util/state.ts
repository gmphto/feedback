/**
 * A generic type that represents an editable state with an original value and a draft value.
 */
export type Editable<P, D> = {
    /**
     * The original value of the editor, which is used to determine if the editor has unsaved changes.
     */
    original: P | undefined

    /**
     * The current draft value of the editor, which can be modified by the user.
     */
    draft: D | undefined
}