import { createAction, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";
import localStorageService from "../services/localStorage.service";
import userService from "../services/user.service";
import { generateAuthError } from "../utils/generateAuthError";
import getRandomInt from "../utils/getRandomInt";
import history from "../utils/history";
const initialState = localStorageService.getAccessToken()
    ? {
          entities: null,
          isLoading: true,
          error: null,
          auth: { userId: localStorageService.getUserId() },
          isLoggedIn: true,
          dataLoaded: false
      }
    : {
          entities: null,
          isLoading: false,
          error: null,
          auth: null,
          isLoggedIn: false,
          dataLoaded: false
      };

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        usersRequested: (state) => {
            state.isLoading = true;
        },
        usersReceved: (state, actions) => {
            state.entities = actions.payload;
            state.dataLoaded = true;
            state.isLoading = false;
        },
        usersRequestFailed: (state) => {
            state.error = actions.payload;
            state.isLoading = false;
        },
        authRequestSuccess: (state, actions) => {
            state.auth = actions.payload;
            state.isLoggedIn = true;
        },
        authRequestFailed: (state, actions) => {
            state.error = actions.payload;
        },
        userCreated: (state, actions) => {
            state.entities.push(actions.payload);
        },
        userLoggedOut: (state) => {
            state.entities = null;
            state.isLoggedIn = false;
            state.auth = null;
            state.dataLoaded = false;
        },
        userUpdateSuccess: (state, actions) => {
            const index = state.entities.findIndex(
                (u) => u._id === actions.payload._id
            );
            console.log(index);
            state.entities[index] = actions.payload;
        },
        userUpdateFailed: (state, actions) => {
            state.error = actions.payload;
        },
        authRequested: (state) => {
            state.error = null;
        }
    }
});
const { reducer: usersReducer, actions } = usersSlice;
const {
    usersRequested,
    usersRequestFailed,
    usersReceved,
    authRequestSuccess,
    authRequestFailed,
    userCreated,
    userLoggedOut,
    userUpdateFailed,
    userUpdateSuccess
} = actions;
const authRequested = createAction("users/authRequested");
const userCreateRequested = createAction("users/userCreateRequested");
const createUserFailed = createAction("users/createUserFailed");
const userUpdateRequested = createAction("users/userUpdateRequested");

export const login =
    ({ payload, redirect }) =>
    async (dispatch) => {
        const { email, password } = payload;

        dispatch(authRequested());
        try {
            const data = await authService.login({ email, password });
            dispatch(authRequestSuccess({ userId: data.localId }));

            localStorageService.setTokens(data);

            history.push(redirect);
        } catch (error) {
            const { code, message } = error.response.data.error;
            if (code === 400) {
                const errorMessage = generateAuthError(message);
                dispatch(authRequestFailed(errorMessage));
            } else {
                dispatch(authRequestFailed(error.message));
            }
        }
    };
export const signUp =
    ({ email, password, ...rest }) =>
    async (dispatch) => {
        dispatch(authRequested());
        try {
            const data = await authService.register({ email, password });
            localStorageService.setTokens(data);
            dispatch(
                createUser({
                    _id: data.localId,
                    email,
                    rate: getRandomInt(1, 5),
                    completedMeetings: getRandomInt(0, 200),
                    image: `https://avatars.dicebear.com/api/avataaars/${(
                        Math.random() + 1
                    )
                        .toString(36)
                        .substring(7)}.svg`,
                    ...rest
                })
            );
            dispatch(authRequestSuccess({ userId: data.localId }));
        } catch (error) {
            dispatch(authRequestFailed(error.message));
        }
    };
export const logOut = () => (dispatch) => {
    localStorageService.removeAuthData();
    dispatch(userLoggedOut());
    history.push("/");
};
function createUser(payload) {
    return async function (dispatch) {
        dispatch(userCreateRequested());

        try {
            const { content } = await userService.create(payload);
            dispatch(userCreated(content));
            history.push("/users");
        } catch (error) {
            dispatch(createUserFailed(error.message));
        }
    };
}
export const loadUsersList = () => async (dispatch) => {
    dispatch(usersRequested());
    try {
        const { content } = await userService.get();
        dispatch(usersReceved(content));
    } catch (error) {
        dispatch(usersRequestFailed(error.message));
    }
};
export const updateUserData =
    ({ payload, redirect }) =>
    async (dispatch) => {
        console.log("payload", payload);
        dispatch(userUpdateRequested());
        try {
            const { content } = await userService.update(payload);
            console.log("content", content);
            dispatch(userUpdateSuccess(content));
            history.push(redirect);
        } catch (error) {
            dispatch(userUpdateFailed(error.message));
        }
    };
export const getUsersList = () => (state) => state.users.entities;
export const getCurrentUserData = () => (state) => {
    return state.users.entities
        ? state.users.entities.find((u) => u._id === state.users.auth.userId)
        : null;
};

export const getUserById = (userId) => (state) => {
    if (state.users.entities) {
        return state.users.entities.find((u) => u._id === userId);
    }
};
export const getIsLoggedIn = () => (state) => state.users.isLoggedIn;
export const getDataStatus = () => (state) => state.users.dataLoaded;
export const getUserLoadingStatus = () => (state) => state.users.isLoading;
export const getAuthErrors = () => (state) => state.users.error;
export const getCurrentUserId = () => (state) => state.users.auth.userId;
export default usersReducer;
