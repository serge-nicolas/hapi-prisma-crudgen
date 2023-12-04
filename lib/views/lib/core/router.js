const sendHashChangeEvent = (hash, app) => {
  app.stores.storeRoute.dispatch({ type: "HASH_CHANGE", payload: hash });
};

const initRouter = (app) => {
  window.onhashchange = function (ev) {
    sendHashChangeEvent(ev.target.location.hash, app);
  };
  return app.stores.storeRoute;
};

export default initRouter;
