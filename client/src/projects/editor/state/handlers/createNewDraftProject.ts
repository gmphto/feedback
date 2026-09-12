import type { ProjectDraft } from "../../types/projectDraft";
import { validateProject } from "../../validation";

type DateString = string;

export const createNewDraftProject = (): ProjectDraft => {
    const draft: Omit<ProjectDraft, "validation"> = {
        isNew: true,
        hasChanged: true,
        isReadOnly: false,
        name: "",
        projectNumber: 0,
    };

    return { ...draft, validation: validateProject(draft) };
};

export function createLocalProjectDateString(date: Date): DateString {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T00:00:00`;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}
