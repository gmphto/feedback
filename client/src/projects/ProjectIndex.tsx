import { ProjectDashboard } from "./dashboard/Dashboard";
import { ProjectEditor } from "./editor/Editor";
import { selectView } from "./state/selector";
import { useAppSelector } from "./types";

export function ProjectIndex() {    
    const view = useAppSelector(selectView);

    return view === "editor" ? <ProjectEditor /> : <ProjectDashboard />
}