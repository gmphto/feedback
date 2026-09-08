import { beforeEach, expect, it, vi } from "vitest";
import { CommitButton } from "./CommitButton";

const mocks = vi.hoisted(() => ({
    dispatch: vi.fn(),
    updateProject: vi.fn(),
    unwrap: vi.fn(),
    validateBeforeSave: vi.fn(),
    isSaving: false,
}));

vi.mock("../../../../api/api", () => ({
    useUpdateProjectMutation: () => [mocks.updateProject, { isLoading: mocks.isSaving }],
}));
vi.mock("../../../../store", () => ({ useAppDispatch: () => mocks.dispatch }));
vi.mock("../../../../state/slice", () => ({
    projectActions: { stopEditProject: () => ({ type: "projects/stopEditProject" }) },
}));
vi.mock("../../../hooks/saveContext", () => ({
    useSaveContext: () => ({
        draftToSave: { projectId: 7, name: "Project", idea: "Starting idea", isNew: false },
        canSave: true,
        showSave: true,
        commandText: "Save changes",
        validateBeforeSave: mocks.validateBeforeSave,
    }),
}));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.isSaving = false;
    mocks.validateBeforeSave.mockResolvedValue(true);
    mocks.updateProject.mockReturnValue({ unwrap: mocks.unwrap });
    mocks.unwrap.mockResolvedValue({});
});

it("awaits validation before sending an update", async () => {
    mocks.validateBeforeSave.mockResolvedValue(false);
    await CommitButton()!.props.children[0].props.onClick();
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
});

it("sends only the update fields and closes after success", async () => {
    await CommitButton()!.props.children[0].props.onClick();
    expect(mocks.updateProject).toHaveBeenCalledWith({
        projectId: 7, name: "Project", description: "Starting idea",
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "projects/stopEditProject" });
});

it("keeps the editor open when saving fails and blocks saving while pending", async () => {
    mocks.unwrap.mockRejectedValue(new Error("Save failed"));
    await CommitButton()!.props.children[0].props.onClick();
    expect(mocks.dispatch).not.toHaveBeenCalled();

    mocks.updateProject.mockClear();
    mocks.isSaving = true;
    const button = CommitButton()!.props.children[0];
    expect(button.props.disabled).toBe(true);
    await button.props.onClick();
    expect(mocks.updateProject).not.toHaveBeenCalled();
});
