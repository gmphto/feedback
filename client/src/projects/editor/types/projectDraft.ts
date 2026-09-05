import type { ProjectValidationStatus } from "../validation";
import type { Project } from "../../types/project";
/*
* Draft of a project, used while a plan is being edited
*/
export interface ProjectDraft extends Omit<Project, "childred"> {

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
    validation: ProjectValidationStatus;
    
}
