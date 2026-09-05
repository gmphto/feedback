import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * This is dispatched to refresh the data held be the global ProjectsAPI
 */
export const refreshAsync = createAsyncThunk(
    'projects/refresh',
    async ( 
        { api, auto, reason }: { api: ProjectApi; auto: boolean; reason: string }
    ) => {

        if (!auto !== undefined) {
            await api.refresh(auto, reason);
        }

        const projects = api.getProjects();

        return {
            projects,
        }
    }
)

