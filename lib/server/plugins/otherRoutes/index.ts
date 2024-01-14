/**
 * generate other routes defined in folder ./server/routes
 * for API (upload, graphql, etc)
 * handle the logic of routing (resquest/hendler/response)
 * logic of the route must be defined in server/routes folder and will be autoloaded
 * filename "METHOD route_segment1,route_segement2[,...].handler.ts
 *
 *
 * TODO : add system to ovveride / complete
 */

import Hapi from "@hapi/hapi";
import { loadRoutesInFolder } from "../../controlers/routes";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
  }
}

const otherRoutes: Hapi.Plugin<null> = {
  dependencies: ["config", "logger"],
  pkg: {
    name: "otherRoutes",
  },
  register: async function (server: Hapi.Server, options: any = {}) {
    const logger = server.app.logger;
    logger.debug("loading other routes", Object.keys(server.app).includes("config"))
    if (Object.keys(server.app).includes("config")) {
      const config = server.app.config;
      
      await loadRoutesInFolder(
        server,
        [`${__dirname}/routes`],
        server.app.logger,
        config
      );
    } else {
      server.app.logger.error("config not defined");
    }
  },
};

export default otherRoutes;
