import { LOGIN, LOGIN_FAILED } from "../constant/login"

const initialState = {
    result: null,
    isLoadData: false,
    isError: false,
}

const loginReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case LOGIN:
            return { ...state, result: payload, isLoadData: true, isError: false }
        case LOGIN_FAILED:
            return { ...state, result: null, isLoadData: false, isError: true }
        default:
            return state;
    }
}

export default loginReducer