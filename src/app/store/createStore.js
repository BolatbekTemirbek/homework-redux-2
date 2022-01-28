import commentsReducer from "./comments";
import professionsReducer from "./professions";
import qualitiesReducer from "./qualities";
import usersReduser from "./users";
const { combineReducers, configureStore } = require("@reduxjs/toolkit");

const rootReducer = combineReducers({
    qualities: qualitiesReducer,
    professions: professionsReducer,
    users: usersReduser,
    comments: commentsReducer
});

export function createStore() {
    return configureStore({
        reducer: rootReducer
    });
}
