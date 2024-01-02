import Singleton from "../../common/SingletonClass.js";
import { stores as storeManager } from "../../core/stores.js";

class FormRenderer extends Singleton {
  #app = {};
  #enums = {};
  #meta = {};
  #hasChanged = false;
  #formData = {};
  #formModel = {};
  #valuesChanged = new Set();
  #formSavedModel = {};
  #buttonSubmit;
  #refs = new Set(); // store all elments input

  constructor(app) {
    super();
    this.#app = app;
    this.init();
  }

  init() {
    // get data from api
    storeManager.subscribeTo("storeFormData", (data) => {
      this.#hasChanged = data.hasChanged;
      delete data.hasChanged;
      this.#formData = data;
      Object.keys(this.#formData).forEach((formKey) => {
        this.#refs.add(formKey);
      });
    });
    
  }
  async getEnums() {
    return this.#meta.$enums;
  }
  async getFields(model) {
    const fields = this.#meta.$models.filter((m) => m.name === model)[0].fields;
    // add possible values for enums
    let fieldsWithEnums = {};
    Object.keys(fields).forEach((f) => {
      const field = fields[f];
      if(field) {
        if (field.isEnum) {
          field["enumValues"] = Object.keys(this.#meta.$enums[field.typeName]);
          field["typeName"] = "Select";
        }
        if (field.isList) {
          field["listValues"] = Object.keys(this.#meta.$list[field.typeName]);
        }
        fieldsWithEnums = { ...fieldsWithEnums, [f]: { ...field } };
      }
    });
    return fieldsWithEnums;
  }
  async formSubmit(e) {
    e.preventDefault();
    this.formSavedModel = this.formModel;
    const formAlert = document.querySelector("form .form-alert");
    formAlert.innerText = "Form saved";
  }
  /*
   * watch form changes and setup submit button status
   * @param {*} target
   */
  watchFormValues(target) {
    const form = document.querySelector(`${target}`);
    
    this.#buttonSubmit.disabled = true;

    function updateModel(data) {
      this.#valuesChanged.add(data.target.getAttribute("ref"));
      this.#formModel = {
        ...this.#formModel,
        [data.target.getAttribute("ref")]: data.target.value,
      };
      this.#buttonSubmit.disabled = this.#formModel === this.#formSavedModel;
      document.querySelector("#changedData").innerHTML = [...this.#valuesChanged].join("<br />");
    }
    [...this.#refs].forEach(ref => {
      document.querySelector(`[ref="${ref}"`).addEventListener("change", updateModel.bind(this))
    });
    
  }
  /**
   * create form
   *
   * @param {*} target root element of form
   * @param {*} route submit route
   * @param {*} templateSelector
   * @param {*} data coming from HapiJS
   * @callback Function callback when form is build (ie: show form)
   */
  async buildForm(
    target,
    route,
    templateSelector,
    data,
    callback = function () {}
  ) {
    this.#refs = new Set();
    const action =
      route.action.toLowerCase() === "NEW" ? "createOne" : "updateOne";
    document.querySelector(
      `${target}`
    ).action = `/api/${route.model.toLowerCase()}/${action}`;

    
    const parent = document.querySelector(`${target} .form-body`); // DOC retrieve node from target
    if (!_.isElement(parent)) {
      throw new Error("parent to form is not defined");
    }
    parent.innerHTML = "";
    this.#meta = await this.#app.stores.storeMeta.getState();
    const fields = await this.getFields(route.model);

    const enums = await this.getEnums();
    const templates = document.querySelectorAll(
      `${target} ${templateSelector}`
    );

    const formContainer = document.createElement("div");

    Object.keys(fields).forEach((id) => {
      const field = fields[id];
      const fieldTemplate = Array.from(templates).filter(
        (template) => template.dataset.for === field.typeName
      )[0];

      if (fieldTemplate) {
        const compiled = _.template(fieldTemplate.innerHTML);
        const formElt = document.createElement("div");

        if (field.enumValues?.length > 0) {
          const selectElts = field.enumValues.map((value) => {
            return `<option ${
              value === data[id] ? "selected" : ""
            }>${value}</option>`;
          });
          formElt.innerHTML = compiled(field);
          formElt.querySelector(`[ref="${id}"]`).innerHTML =
            selectElts.join("\n");
        } else {
          formElt.innerHTML = compiled(field);
          formElt.querySelector(`[ref="${id}"]`).value = data[id];
        }
        formContainer.appendChild(formElt);
        this.#refs.add(id);
      }
    });
    parent.appendChild(formContainer);
    this.#buttonSubmit = document.querySelector(
      `${target} button[type="submit"]`
    );
    this.#buttonSubmit.addEventListener("click", this.formSubmit);
    this.watchFormValues(target);
    callback();
  }
  set formSavedModel(values) {
    this.#formSavedModel = values;
  }
  get formModel() {
    return this.#formModel;
  }
}

export { FormRenderer as Form };
