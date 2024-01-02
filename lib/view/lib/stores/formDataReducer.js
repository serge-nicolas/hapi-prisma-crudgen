const formDataReducer = async (state = {}, action) => {
    const newState = action.payload;
    const hasChanged = state !== newState;
    return { ...state, hasChanged};
}


export default formDataReducer;