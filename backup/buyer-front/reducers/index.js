import { combineReducers } from "redux";

import loginReducer from './login.reducer'
import loadingOverlay from './loading.reducer'

// COMBINED REDUCERS
const reducers = {
    loginReducer,
    loadingOverlay
};

export default combineReducers(reducers);
