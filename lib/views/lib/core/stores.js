import loggerMiddleware from "../middleware/logger.js";

import Singleton from "../common/SingletonClass.js";

// reducer
import metaReducer from "../stores/metaReducer.js";
import leftMenuReducer from "../stores/leftMenuReducer.js";
import loadDataReducer from "../stores/loadDataReducer.js";
import rightbarReducer from "../stores/rightbarReducer.js";
import routeReducer from "../stores/routeReducer.js";
import formDataReducer from "../stores/formDataReducer.js";

const middlewareEnhancer = Redux.applyMiddleware(loggerMiddleware);

class Stores extends Singleton {
  #stores = {};
  constructor() {
    super();
  }
  createStore(name, reducer) {
    if (!!!this.#stores[name]) {
      this.#stores[name] = {};
    }
    this.#stores[name] = Redux.createStore(reducer, middlewareEnhancer);
  }
  createStores() {
    this.createStore("storeMeta", metaReducer);
    this.createStore("storeLeftMenu", leftMenuReducer);
    this.createStore("storeRightbar", rightbarReducer);
    this.createStore("storeData", loadDataReducer);
    this.createStore("storeRoute", routeReducer);
    this.createStore("storeFormData", formDataReducer);
    return this.#stores;
  }
  get stores() {
    return this.#stores;
  }
  static get instance() {
    return this;
  }
  subscribeTo(store, callback) {
    if (this.#stores[store]) {
      this.#stores[store].subscribe(callback);
    } else {
      throw new Error("no defined store named " + store);
    }
  }
  dispatchTo(store, values) {
    if (this.#stores[store]) {
      this.#stores[store].dispatch(values);
    } else {
      throw new Error("no defined store named " + store);
    }
  }
}
export const stores = new Stores();
