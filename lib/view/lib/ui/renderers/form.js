import Singleton from "../../common/SingletonClass.js";
import { stores as storeManager } from "../../core/stores.js";
/**
 * build form and handle all mecanism
 */

// TODO remove undescore dependancy

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
    if (!this.#app.path.api || !this.#app.path.meta) {
      throw new Error("meta or api path not defined");
    }

    this.init();
  }

  init() {
    // USAGE ?
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

  /**
   * return fields form meta
   * @param {*} model 
   * @returns 
   */
  async getFields(model) {
    const metaModel = this.#meta.$models.filter((m) => m.name === model)[0];
    const fields = metaModel.fields;
    // add possible values for enums
    let fieldsWithEnums = {};
    Object.keys(fields).forEach((f) => {
      const field = fields[f];
      if (field) {
        if (field.isEnum) {
          field["enumValues"] = Object.keys(this.#meta.$enums[field.typeName]);
          field["typeName"] = "Select";
        }
        // TODO data taken from others field linked
        if (field.isList) {
          // field["listValues"] = Object.keys(this.#meta.$list[field.typeName]);
        }
        fieldsWithEnums = { ...fieldsWithEnums, [f]: { ...field } };
      }
    });
    return fieldsWithEnums;
  }
  /**
   * submit form with visual feedback
   * @param {*} e event
   */
  async formSubmit(e) {
    e.preventDefault();
    this.formSavedModel = this.formModel;
    const formAlert = document.querySelector("form .form__main-alert");
    formAlert.innerText = "Form saved";
    formAlert.classList.remove("hidden");
    formAlert.classList.add("block");
    setTimeout(() => {
      formAlert.classList.remove("block");
      formAlert.classList.add("hidden");
    }, 3000);
  }
  /** 
   * watch form changes and setup submit button visibility
   * @param {*} target dom target
   * 
   * 
   */
  watchFormValues(target) {
    const form = document.querySelector(`${target}`);

    this.#buttonSubmit.disabled = true;

    function updateModel(data) {
      console.log(data);
      this.#valuesChanged.add(data.target.getAttribute("ref"));
      this.#formModel = {
        ...this.#formModel,
        [data.target.getAttribute("ref")]: data.target.value,
      };
      this.#buttonSubmit.disabled = this.#formModel === this.#formSavedModel;
      document.querySelector("#changedData").innerHTML = [...this.#valuesChanged].join("<br />");
    }
    // add listener to handle changes in form and models
    [...this.#refs].forEach(ref => {
      console.log(document.querySelector(`[ref="${ref}"`), ref);
      if (document.querySelector(`[ref="${ref}"`))
        document.querySelector(`[ref="${ref}"`).addEventListener("change", updateModel.bind(this))
    });

  }
  /**
   * create form from existing HTML and data
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
    callback = function () { }
  ) {

    const formTargetExist = !!document.querySelector(
      `${target}`
    );

    if (!route.path.action) throw new Error("no action defined");
    if (!formTargetExist) throw new Error("no target form"); // no id, so no form then exit

    this.#refs = new Set();
    const action =
      route.query?.id ? "updateOne" : "create";

    document.querySelector(
      `${target}`
    ).action = process.env.API + `${route.path.model.toLowerCase()}/${action}`

    document.querySelector(
      `${target}`
    ).method = action === "create" ? "PUT" : "PATCH";

    const parent = document.querySelector(`${target} .form__main-body`);
    // FEATURE retrieve node from target
    // TODO remove undescore dependancy
    if (!_.isElement(parent)) {
      throw new Error("parent to form is not defined");
    }
    parent.innerHTML = "";
    this.#meta = await this.#app.stores.storeMeta.getState();
    const fields = await this.getFields(route.path.model);

    const enums = await this.getEnums();
    const templates = document.querySelectorAll(
      `${target} ${templateSelector}`
    );

    const formContainer = document.createElement("div");

    // display items from templates
    if (Array.from(templates).length > 0) {
      Object.keys(fields).forEach((index) => {
        const field = fields[index];
        if (field.name) {
          const fieldRef = `${field.modelName}-${field.name}`;
          const fieldTemplate = Array.from(templates).filter(
            (template) => template.dataset.for === field.typeName
          )[0];

          if (fieldTemplate) {
            const compiled = _.template(fieldTemplate.innerHTML);
            const formElt = document.createElement("div");

            if (field.enumValues?.length > 0) {
              formElt.innerHTML = compiled(field);
              formElt.querySelector(`[ref="${fieldRef}"]`).required = field.isRequired || false;
              formElt.querySelector(`[ref="${fieldRef}"]`).readOnly = field.isReadonly || false;
              const selectElement = formElt.querySelector(`[ref="${fieldRef}"]`);
              [...field.enumValues].forEach((option, key) => {
                selectElement.add(new Option(option, key, false, option === data[field.name]));
              });
            } else {
              formElt.innerHTML = compiled(field);
              formElt.querySelector(`[ref="${fieldRef}"]`).readOnly = field.isReadonly || false;
              formElt.querySelector(`[ref="${fieldRef}"]`).required = field.isRequired || false;
              formElt.querySelector(`[ref="${fieldRef}"]`).value = data[field.name] || "";
              formElt.querySelector(`[ref="${fieldRef}"]`).pattern = field.pattern;
              if (field.pattern) formElt.querySelector(`[ref="${fieldRef}"]`).classList.add("invalidData");
            }
            formContainer.appendChild(formElt);
            // watch field change
            if (!field.shouldHide)
              this.#refs.add(fieldRef);
            console.log(this.#refs);
          } else {
            console.log("missing template for", fieldRef, field.typeName);
          }
        }
      });
      parent.appendChild(formContainer);
      this.#buttonSubmit = document.querySelector(
        `${target} button[type="submit"]`
      );
      this.#buttonSubmit.addEventListener("click", this.formSubmit);
      this.watchFormValues(target);

      callback();
    } else {
      throw Error("no templates");
    }
  }
  // Getters / setters
  set formSavedModel(values) {
    this.#formSavedModel = values;
  }
  get formModel() {
    return this.#formModel;
  }
  async getEnums() {
    return this.#meta.$enums;
  }
}

export { FormRenderer };
