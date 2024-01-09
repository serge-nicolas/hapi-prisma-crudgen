

// event management for router
/**
 * send event when hash changes
 * @param {*} route 
 * @param {*} app 
 */
const sendHashChangeEvent = (route, app) => {
  console.log(route);
  app.stores.storeRoute.dispatch({ type: "HASH_CHANGE", payload: route });
};
/**
 * send event when route change
 * @param {*} route 
 * @param {*} app 
 */
const sendRouteChangeEvent = (route, app) => {
  app.stores.storeRoute.dispatch({ type: "ROUTE_CHANGE", payload: route });
};

/**
 * init router with reducer
 * @param {*} app 
 * @returns 
 */
const initRouter = (app) => {
  window.onhashchange = function (ev) {
    sendHashChangeEvent(ev.target.payload, app);
  };
  // init
  sendRouteChangeEvent(window.location, app);

  app.stores.storeRoute.subscribe(async () => {
    const r = (await app.stores.storeRoute.getState()).path;
    document.querySelector(`.route-${r.action}`).classList.replace("hidden", "block");
  });

  return app.stores.storeRoute;
};

export default initRouter;
