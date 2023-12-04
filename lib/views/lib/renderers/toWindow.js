const initialState = {};

const renderToWindowVar = (...props) => {
  console.log(
    "🚀 ~ file: toWindow.js:2 ~ renderToWindowVar ~ state, action:",
    props
  );
  /* window[action] = state.map((obj) => obj.name);
  console.log(window[action]); */
};

export default renderToWindowVar;
