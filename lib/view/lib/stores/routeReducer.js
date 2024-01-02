const parseHash = (hash) => {
  return hash
    .substring(1)
    .split("&")
    .map((v) => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
    .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});
};
let history = [];
const routeReducer = async (state = {}, action) => {
  if (!!action) {
    if (action.type === "HASH_CHANGE") {
      const newHash =
        typeof action.payload === "string"
          ? parseHash(action.payload)
          : action.payload;
      const newState = {
        path: action.payload,
        ...newHash,
      };
      history.push(newState);
      return newState;
    }
  }
  return state;
};

export default routeReducer;
