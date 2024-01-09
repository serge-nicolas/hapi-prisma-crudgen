import Singleton from "../../common/SingletonClass.js";
import { stores as storeManager } from "../../core/stores.js";
/**
 * build form and handle all mecanism
 */

class TableRenderer extends Singleton {
  #app = {};
  #route = {};
  #selectedModel = {};
  #selectedFields = {};

  constructor(app) {
    super();
    this.#app = app;
    this.#route = this.#app.currentRoute;
    if (!this.#app.path.api || !this.#app.path.meta) {
      throw new Error("meta or api path not defined");
    }
  }
  async buildTable(target, route, $models) {


    const itemTargetExist = !!document.querySelector(
      `${target}`
    );
    this.#route = route;
    console.log("this.#app.currentRoute", this.#route);


    this.#selectedModel = $models.filter(model => model.name === this.#route.path.model)[0];

    if (this.#selectedModel) {
      this.#selectedFields = this.#selectedModel.view.tableFields;
    } else {
      throw new Error("no model defined");
    }

    if (!this.#route.path.action) throw new Error("no action defined");
    if (!itemTargetExist) throw new Error("no target table:" + target);

    document.querySelector(target).innerHTML = "loading...";

    try {
      const select = JSON.stringify(this.#selectedFields);
      const response = await fetch(process.env.API + `${this.#route.path.model.toLowerCase()}/findMany?select=${select}`);
      const data = await response.json();

      console.log(data);

      if (data.length < 1) {
        document.querySelector(target).innerHTML = "empty!";
        return;
      } else {
        document.querySelector(target).innerHTML = "";
        const idColNum = Object.keys(data[0]).indexOf("id");
        const createdAtColNum = Object.keys(data[0]).indexOf("createdAt");
        const updatedAtColNum = Object.keys(data[0]).indexOf("updatedAt");
        const table = new window.simpleDatatables.DataTable(target, {
          columns: [
            {
              select: idColNum,
              render: (value, _td, _rowIndex, _cellIndex) => `<a class="btn-primary" href="/admin/${this.#route.path.model}/edit?where=${encodeURIComponent(JSON.stringify({ id: value[idColNum].data }))}">EDIT</span>`,
            },
            {
              select: updatedAtColNum,
              render: (value, _td, _rowIndex, _cellIndex) => moment(value.updatedAt).format("L hh:mm:ss")
            },
            {
              select: createdAtColNum,
              render: (value, _td, _rowIndex, _cellIndex) => moment(value.createdAt).format("L hh:mm:ss")
            },
          ],
          labels: {
            placeholder: "Search " + pluralize(this.#route.path.model) + "...",
            perPage: pluralize(this.#route.path.model) + " per page",
            noRows: "No " + this.#route.path.model + " to display",
            info:
              "Showing {start} to {end} of {rows} " +
              pluralize(this.#route.path.model) +
              " (Page {page} of {pages} pages)",
          },
          data: {
            headings: ["", ...Object.keys(data[0]).splice(1)],
            data: data.map((item) => [...Object.values(item)]),
          },
          layout: {
            top: "{select}{search}",
            bottom: "{info}{pager}",
          },
        });
      }

    } catch (error) { }
  };
}


export { TableRenderer };
// 