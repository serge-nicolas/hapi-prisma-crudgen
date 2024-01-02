const rightbarReducer = async (state = false, action = "TOOGLE") => {
  switch (action) {
    case "TOOGLE":
        return !state;
      break;
  }
};
export default rightbarReducer;