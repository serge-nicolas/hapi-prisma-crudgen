const singleton = Symbol("singleton");

class Singleton {
  static instance;

  constructor() {
    return this;
  }
  static get instance() {
    return this;
  }
}
export default Singleton;
