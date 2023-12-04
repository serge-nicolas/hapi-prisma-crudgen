import { loadMeta } from "../core/services.js";

const metaReducer = async (state = {}, action = "load") => {
  state = await loadMeta();
  return state;
};

export default metaReducer;
