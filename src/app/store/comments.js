import { createAction, createSlice } from "@reduxjs/toolkit";
import commentService from "../services/comment.service";

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        entities: null,
        isLoading: true,
        error: null
    },
    reducers: {
        commentsRequested: (state) => {
            state.isLoading = true;
        },
        commentsReceved: (state, actions) => {
            state.entities = actions.payload;
            state.isLoading = false;
        },
        commentsRequestField: (state) => {
            state.error = actions.payload;
            state.isLoading = false;
        },
        createCommentSuccess: (state, actions) => {
            state.entities.push(actions.payload);
        },
        createCommentsFailed: (state, actions) => {
            state.error = actions.payload;
        },
        removeCommentSuccess: (state, actions) => {
            const index = state.entities.findIndex(
                (u) => u._id === actions.payload
            );
            state.entities.splice(index, 1);
        }
    }
});

const { reducer: commentsReducer, actions } = commentsSlice;
const {
    commentsRequested,
    commentsRequestField,
    commentsReceved,
    createCommentSuccess,
    createCommentsFailed,
    removeCommentSuccess
} = actions;
const createCommentRequested = createAction("comments/createCommentRequested");
const removeCommentRequested = createAction("comments/removeCommentRequested");

export const loadCommentsList = (userId) => async (dispatch) => {
    dispatch(commentsRequested());
    try {
        const { content } = await commentService.getComments(userId);
        dispatch(commentsReceved(content));
    } catch (error) {
        dispatch(commentsRequestField(error.message));
    }
};
export const createComment = (payload) => async (dispatch) => {
    dispatch(createCommentRequested());
    try {
        const { content } = await commentService.createComment(payload);

        dispatch(createCommentSuccess(content));
    } catch (error) {
        dispatch(createCommentsFailed(error.message));
    }
};
export const removeComment = (id) => async (dispatch) => {
    dispatch(removeCommentRequested());
    try {
        const { content } = await commentService.removeComment(id);
        if (content === null) {
            dispatch(removeCommentSuccess(id));
        }
    } catch (error) {
        dispatch(createCommentsFailed(error.message));
    }
};
export const getComments = () => (state) => state.comments.entities;
export const getCommentsLoadingStatus = () => (state) =>
    state.comments.isLoading;
export default commentsReducer;
