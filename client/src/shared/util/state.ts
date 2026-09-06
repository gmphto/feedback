export type Draft<T, TValidation> = T & {

        /**
         * True if this is a new project
         */
        isNew: boolean;
    
        /**
         * True if the project is read-only
         */
        isReadOnly: boolean;
    
        /** 
         * True if has changed since it was open in the editor 
         * */
        hasChanged: boolean;
    
    
        /**
         * Validation status of the project draft
         */
        validation: TValidation | undefined;
        
    }

/**
 * A generic type that represents an editable state with an original value and a draft value.
 */
export type Editable<T, TValidation> = {
    /**
     * The original value of the editor, which is used to determine if the editor has unsaved changes.
     */
    original: T | undefined

    /**
     * The current draft value of the editor, which can be modified by the user.
     */
    draft: Draft<T, TValidation> | undefined

    /**
     * Show validatoin errors or not
     * 
     */
    showValidationErrors?: boolean

}