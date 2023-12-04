import { stores as storesManager } from "./stores.js";
import initRouter from "./router.js";
import * as services from "./services.js";

// ui
import { buildTable, Form } from "../ui/renderers/index.js";
import Singleton from "../common/SingletonClass.js";

class APP extends Singleton {
  #router = {};
  #stores = {};
  #services = {};
  #listener = null;
  #domHost = "";
  #renderers = {};
  #route = {};

  constructor() {
    super();
    this.#renderers = {
      form: {},
      table: buildTable,
    };
    return this;
  }

  init(domHost = "#app") {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    this.#domHost = domHost;
    this.#listener = new EventTarget();
    window.addEventListener("DOMContentLoaded", (event) => {
      this.stores = storesManager.createStores();
      this.#renderers.form = new Form(this);

      // DOC initial load of page
      this.router = initRouter(this);
      this.services = services;
      document
        .querySelector(this.#domHost)
        .classList.replace("hidden", "inline");

      //DOC start app event
      this.readyEvent();
      this.#listener.dispatchEvent(new CustomEvent("ready", {}));
    });
    return this;
  }

  readyEvent() {
    document.querySelector("[role='status']").classList.add("hidden");
    document.querySelector("[role='app']").classList.remove("hidden");
    this.initRouterListener();
    // first load
    this.router.dispatch({
      type: "HASH_CHANGE",
      payload: window.location.hash,
    });
    return this;
  }

  initRouterListener() {
    this.router.subscribe(async () => {
      this.resetRender([this.#domHost]);
      const route = await this.router.getState();
      this.#route = route;
      this.#listener.dispatchEvent(new CustomEvent("routeChange", { route }));
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
            document.querySelector(".form-title").innerText =
              "New: " + route.model;
            /* this.#renderers.form.buildForm(
              ".form",
              route,
              "template.form-field-template"
            );
            document
              .querySelector(this.#domHost + " .child-container.form-container")
              .classList.replace("hidden", "block"); */
            break;
        }
      }
    });
  }

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
  get formRenderer() {
    return this.#renderers.form;
  }
  get currentRoute() {
    return this.#route;
  }
}
export const app = new APP();
