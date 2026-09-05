type DateString = string; // ISO 8601 date string

type DateNumber = number; // Unix timestamp in milliseconds

export type GuidString = `${string}-${string}-${string}-${string}-${string}`; // UUID v4 string

export interface Project {

    /**
     * The unique identifier for the project.
     */
    projectId: number;

    /**
     * The name of the project. This field is required and should be a non-empty string.
     */
    name: string;

    /**
     * The project number. This field is optional and can be left empty.
     */
    projectNumber?: string;

    /**
     * A brief description of the project.
     * This field is optional and can be left empty.
     */
    idea?: string;
    job?: string;
    problem?: string;
    mvpOutcome?: string;
    initialProductAreas?: string;
    constraints?: string;

    /** 
     * The date and time when the project was created. 
     */
    createdOn?: DateString;
    updatedOn?: DateString;
    createdBy?: number;
    updatedBy?: number;

}