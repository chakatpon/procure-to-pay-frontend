import { LOGIN, LOGIN_FAILED } from "../constant/login"

export const setLoginToSuccess = (payload) => ({
    type: LOGIN,
    payload: payload
});

export const setLoginToFailed = () => ({
    type: LOGIN_FAILED
});

export const getLogin = () => {
    return dispatch => {
        // dispatch(setStateLogToFetching());
        doGetLogin(dispatch);
    };
};

const doGetLogin = async (dispatch) => {
    console.log(dispatch);
    await (result => {
        dispatch(setLoginToSuccess(result));
    }).catch(error => {
        dispatch(setLoginToFailed())
    })
}