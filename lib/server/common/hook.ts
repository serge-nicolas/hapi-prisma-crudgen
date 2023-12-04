import logger from "./logger";
class Hook {
  #data: Array<any> = [];
  #hookPath: String;
  constructor() {}
  set data(data: Array<any>) {
    this.#data = data;
  }
}
class BeforeHook extends Hook {
  constructor(path: string, callback: Function) {
    super();
  }
}
class AfterHook extends Hook {
  constructor(path: string, callback: Function) {
    super();
  }
}

/**
 * store hooks
 *
 * @class Hooks
 */
class Hooks {
  static #instance: Hooks;
  #hooks: Array<AfterHook | BeforeHook>;
  constructor() {}
  static get instance() {
    if (Hooks.#instance) {
      return Hooks.#instance;
    }
    Hooks.#instance = new Hooks();
    return Hooks.#instance;
  }

  excute(path: string) {}

  register(hook: AfterHook | BeforeHook) {
    this.#hooks = [...this.#hooks, hook];
  }

  get list() {
    return this.#hooks;
  }
}

const hooks = Hooks.instance;

export { BeforeHook, AfterHook, hooks };

// create new hook (type = path + callback)
// send data to hook with execute
