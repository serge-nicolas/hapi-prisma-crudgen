import { loadMeta } from "../core/services.js";

const metaReducer = async (state = {}, action = "load") => {
  return await loadMeta();
};

export default metaReducer;
