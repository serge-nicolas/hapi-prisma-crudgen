const singleton = Symbol("singleton");

class Singleton extends Event {
  static instance;

  constructor() {
    super();
    return this;
  }
  static get instance() {
    return this;
  }
}
export default Singleton;
