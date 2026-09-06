import type { ProjectValidationStatus } from "../validation";
import type { Project } from "../../types/project";
import type { Draft } from "../../../shared/util/state";


/*
* Draft of a project, used while a plan is being edited
*/
export interface ProjectDraft
  extends Omit<Project, "children">,
    Draft<Project, ProjectValidationStatus> {}