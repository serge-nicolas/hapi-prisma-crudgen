const logger = (store) => (next) => async (action) => {
  if (!!action) {
    let result = next(action);
    return result;
  }
};

export default logger;
