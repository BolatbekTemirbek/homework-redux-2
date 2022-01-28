import { createSlice } from "@reduxjs/toolkit";
import professionService from "../services/profession.service";
import { isOutdated } from "./qualities";

const professionSlice = createSlice({
    name: "professions",
    initialState: {
        entities: null,
        isLoading: true,
        error: null,
        lastFetch: null
    },
    reducers: {
        professionsRequested: (state) => {
            state.isLoading = true;
        },
        professionsReceved: (state, actions) => {
            state.entities = actions.payload;
            state.lastFetch = Date.now();
            state.isLoading = false;
        },
        professionsRequestField: (state) => {
            state.error = actions.payload;
            state.isLoading = false;
        }
    }
});

const { reducer: professionsReducer, actions } = professionSlice;
const { professionsRequested, professionsRequestField, professionsReceved } =
    actions;
export const loadProfessionsList = () => async (dispatch, getState) => {
    const { lastFetch } = getState().professions;

    if (isOutdated(lastFetch)) {
        dispatch(professionsRequested());
        try {
            const { content } = await professionService.get();
            dispatch(professionsReceved(content));
        } catch (error) {
            dispatch(professionsRequestField(error.message));
        }
    }
};
export const getProfessions = () => (state) => state.professions.entities;
export const getProfessionsLoadingStatus = () => (state) =>
    state.professions.isLoading;
export const getProfessionsById = (professionId) => (state) => {
    if (state.professions.entities) {
        return state.professions.entities.find((p) => p._id === professionId);
    }
};
export default professionsReducer;
