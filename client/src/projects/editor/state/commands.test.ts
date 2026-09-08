import { expect, it } from "vitest";
import type { Project } from "../../types/project";
import { createProjectDraft } from "./handlers/createProjectDraft";
import { getEditorCommands } from "./commands";

it("compares project values, ignoring editor metadata, and respects read-only sessions", () => {
    const original: Project = { projectId: 7, name: "Saved project" };
    const draft = createProjectDraft(original, false);
    const unchanged = getEditorCommands(draft, original, false);

    expect(unchanged.canCancel).toBe(false);
    expect(unchanged.canClose).toBe(true);
    expect(unchanged.save.canSave).toBe(false);
    expect(getEditorCommands({ ...draft, hasChanged: true, validation: undefined }, original, false).save.canSave).toBe(false);

    const changes = {
        projectId: 8,
        name: "Edited project",
        projectNumber: 1,
        idea: "An idea",
        job: "A job",
        problem: "A problem",
        mvpOutcome: "An outcome",
        initialProductAreas: "An area",
        constraints: "A constraint",
        createdOn: "2026-09-06",
        updatedOn: "2026-09-07",
        createdBy: 1,
        updatedBy: 2,
    } satisfies Required<Project>;

    for (const [field, value] of Object.entries(changes)) {
        const changed = { ...draft, [field]: value };
        const commands = getEditorCommands(changed, original, false);
        expect(commands.save.canSave, field).toBe(true);
        expect(commands.canCancel, field).toBe(true);
        expect(commands.canClose, field).toBe(false);
        expect(getEditorCommands(changed, original, true).save.canSave, field).toBe(false);
    }

    expect(getEditorCommands({ ...draft, name: undefined }, original, false).save.canSave).toBe(true);
    expect(getEditorCommands({ ...draft, idea: undefined }, original, false).save.canSave).toBe(false);
    expect(getEditorCommands(draft, undefined, false).save.canSave).toBe(true);
    expect(getEditorCommands(undefined, undefined, undefined).save.canSave).toBe(false);
    expect(getEditorCommands(draft, original, true).save.showSave).toBe(false);
});
