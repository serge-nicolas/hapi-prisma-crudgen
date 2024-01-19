/**
 * add security, define scheme in folder security and name it accordingly to config.server.auth.default.scheme
 * @returns
 */

import Hapi from "@hapi/hapi";
import { loadRoutesInFolder } from "../../controlers/routes";

import type Winston from "winston";

import { fileURLToPath } from 'url';
import {dirname} from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    config: any;
    logger: any;
  }
}

const securityPlugin: Hapi.Plugin<null> = {
  dependencies: ["config", "logger"],
  pkg: {
    name: "security",
  },
  register: async function (server: Hapi.Server, options: any = {}) {
    if (Object.keys(server.app).includes("config")) {
      const config = server.app.config;

      const { init } = await import(
        `./${config.server.auth.default.scheme}.ts`
      );
      init(server, config, options);

      // add login route
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

export default securityPlugin;
