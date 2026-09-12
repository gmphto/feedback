import type { ProjectDraft } from "../editor/types/projectDraft";
import type { Project } from "../types/project";
import type { ApiProject } from "./types";

// server ---> client
export function setupProjects(projects: ApiProject[]): Project[] {
    return (projects || []).map((project) => setupProject(project));
}

function setupProject(project: ApiProject): Project {
    return {

        ...project
    };
}

// client ---> server
export function convertProjectToApi(draft: ProjectDraft): ApiProject {

    // omit validation stuff

    return {

        ...draft
    };
}