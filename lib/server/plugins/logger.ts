import Hapi from "@hapi/hapi";
import logger from "../common/logger";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
  }
}

const loggerPlugin: Hapi.Plugin<null> = {
  pkg: {
    name: "logger",
  },
  register: async function (server: Hapi.Server, options: any = {}) {
    server.app['logger'] = logger;
  },
};

export default loggerPlugin;
