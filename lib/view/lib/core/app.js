import { stores as storesManager } from "./stores.js";
import initRouter from "./router.js";
import * as services from "./services.js";
import { pathToRegexp } from "../common/routeParse.js";

// ui
import { TableRenderer, FormRenderer } from "../ui/renderers/index.js";
import Singleton from "../common/SingletonClass.js";

class APP extends Singleton {
  #router = {};
  #stores = {};
  #services = {};
  #listener = null;
  #domHost = "";
  #renderers = {};
  #route = {};
  #path = {};

  constructor() {
    super();
    this.#renderers = {
      form: {},
      table: {},
    };
    return this;
  }

  init(domHost = "#app") {
    this.#path = {
      api: process.env.API,
      meta: process.env.META,
      assets: process.env.ASSETS
    }
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    this.#domHost = domHost;
    this.#listener = new EventTarget();
    //window.addEventListener("DOMContentLoaded", (event) => {
    this.stores = storesManager.createStores();
    this.#renderers.form = new FormRenderer(this);
    this.#renderers.table = new TableRenderer(this);
    // DOC initial load of page
    // TODO add router
    this.router = initRouter(this);
    this.services = services;
    document
      .querySelector(this.#domHost)
      .classList.replace("hidden", "inline");

    //DOC start app event
    this.readyEvent();
    this.#listener.dispatchEvent(new CustomEvent("ready", {}));
    //});
    return this;
  }

  readyEvent() {
    document.querySelector("[role='status']").classList.add("hidden");
    document.querySelector("[role='app']").classList.remove("hidden");
    this.initRouterListener();
    console.log(window.location.hash)
    // first load
    let currentRoute = pathToRegexp("/admin/:model/:action", window.location);

    if (window.location.search) {
      currentRoute["search"] = new URLSearchParams(window.location.search);
    }
    this.router.dispatch({
      type: "ROUTE_CHANGE",
      payload: currentRoute,
    });
    return this;
  }
  /**
   * init router based on store and send custom event to be catchable outside app
   */
  initRouterListener() {
    this.#stores.storeRoute.subscribe(async () => {
      this.resetRender([this.#domHost]);
      const route = await this.#stores.storeRoute.getState();
      this.#route = route;
      this.#listener.dispatchEvent(new CustomEvent("routeChange", route));
      /*
      if (route.action) {
        switch (route.action.toLowerCase()) {
          case "findmany":
            document.querySelector(".table-title").innerText =
              "List: " + pluralize(route.model);
            this.#renderers.table(".table", route.action, route);
            document
              .querySelector(
                this.#domHost + " .child-container.table-container"
              )
              .classList.replace("hidden", "block");
            break;
          case "new":
            document.querySelector(".form__title").innerText =
              "New: " + route.model;
            break;
        }
      } */
    });
  }
  /**
   * hide the parent element
   * @param {*} parent 
   */
  resetRender(parent) {
    const items = document.querySelectorAll(parent + " > div.child-container");
    items.forEach((item) => {
      item.classList.add("hidden");
      item.classList.remove("block");
    });
  }
  // getters
  get stores() {
    return this.#stores || null;
  }
  get router() {
    return this.#router;
  }
  get services() {
    return this.#services;
  }
  get listener() {
    return this.#listener;
  }
  get formRenderer() {
    return this.#renderers.form;
  }
  get tableRenderer() {
    return this.#renderers.table;
  }
  get currentRoute() {
    return this.#route;
  }
  get path() {
    return this.#path;
  }
  // setters
  set stores(stores) {
    this.#stores = stores;
  }
  set router(router) {
    this.#router = router;
  }
  set services(services) {
    this.#services = services;
  }

}
export const app = new APP();
