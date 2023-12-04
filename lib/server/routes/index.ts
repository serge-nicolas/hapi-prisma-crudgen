import { globSync } from "glob";
import { resolve as pathResolve, basename as pathBasename } from "node:path";

import logger from "../common/logger";

class LoadHandlers {
  static instance: LoadHandlers;
  files: Array<string> = [];
  handlers: any = {};
  handlerLoadPromise: any = [];

  constructor() {
    logger.debug("load handlers for routes");
    this.files = globSync(pathResolve(`${__dirname}/*.handler.ts`));
    this.files.forEach(async (file: string) => {
      this.handlerLoadPromise.push(this.loadHandler(file));
    });
  }
  static getInstance() {
    if (LoadHandlers.instance) {
      return LoadHandlers.instance;
    }
    LoadHandlers.instance = new LoadHandlers();
    return LoadHandlers.instance;
  }
  get allHandlers(): Array<Function> {
    logger.debug(JSON.stringify(Object.keys(this.handlers)));
    return this.handlers;
  }
  async initialize() {
    await Promise.all(this.handlerLoadPromise);
    return this;
  }
  handlerFunction(): Function {
    return () => {};
  }
  private async loadHandler(filename: string) {
    this.handlers[this.filenameAsPath(filename)] = (
      await import(filename)
    ).default;
    return;
  }
  private filenameAsPath(filename: string) {
    return pathBasename(filename, ".handler.ts")
      .replace(",", "/")
      .replace(" ", " /");
  }
}

const handlers: any = (async () => {
  return (await LoadHandlers.getInstance().initialize()).allHandlers;
})();

export default handlers;
