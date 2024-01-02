
import { EventEmitter } from 'https://cdn.jsdelivr.net/npm/tseep@1.1.3/+esm'

class Model extends EventEmitter {
  #modelValue;
  #modelOldValue;
  #model = "";// model name
  constructor(model) {
    super();
    this.#model = model;
  }
  set value(value) {
    this.#modelValue = value;
  }
  set update(value) {
    if(typeof value === "object")
        
    switch(typeof value) {
        case "object":
            this.#modelValue = {
                ...this.#modelValue,
                ...value
            }
            break;
        default:
            this.#modelValue = value;
            break;

    }
    return this; 
  }
  get value() {
    return this.#modelValue;
  }
  listen() {
    this.#modelValue.watch("change", (value) => {
        if(this.#modelValue !== this.#modelOldValue);
            this.emit("hasChanged", value);
    });
  }
}

export { Model };
