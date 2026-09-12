import type { ProjectDraft } from "./types/projectDraft";

export function getValidationMessage(draft: ProjectDraft): string[] {

    const { validation } = draft

    const msg = [validation?.name].filter(
        (m): m is string => !!m
    )

    return msg
}