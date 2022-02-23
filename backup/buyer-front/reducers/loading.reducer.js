import { UNBLOCK_UI,BLOCK_UI } from '../constant/login';

const initialState = {
    blockUI : false,
};

const loadingOverlay = (state = initialState, action) => {
    switch (action.type) {
        case BLOCK_UI:
            return { ...state, blockUI : true }
        case UNBLOCK_UI:
            return { ...state, blockUI : false }
        default:
            return state;
    }

}

export default loadingOverlay;