import { Server as HapiServer } from "@hapi/hapi";
import Inert from "@hapi/inert"; // FEATURE needed for frontend

import type Hapi from "@hapi/hapi";

import prisma from "./plugins/prisma";
import configAdminServer from "./plugins/configAdminServer";
import { rootViewHandler } from "./controlers/template";

import type ServerConfigOptions from "./typings/serverConfigOptions";

// log
import type { Logger } from "winston";
import logger from "./common/logger";

import configure from "./common/loadConfig";
import initPugAdmin from "../view/register";

import loggerPlugin from "./plugins/logger";
import securityPlugin from "./plugins/security";
import otherRoutesPlugin from "./plugins/otherRoutes";

class AdminServer {
  config: any;
  server: HapiServer;
  overrides: any;
  HapiPlugins: Array<any>;
  logger: Logger;

  configFileServer: string;
  configFolder: string;

  constructor(
    { configFileServer, configFolder, overrides }: ServerConfigOptions,
    server: Hapi.Server,
    plugins: Array<any>
  ) {
    this.logger = logger;
    this.logger.debug("starting generator");
    this.config = configure(configFileServer, configFolder);

    this.overrides = overrides;
    this.server = server;
    // register plugin with config and expose
    this.server.app.config = this.config;

    this.configFileServer = configFileServer;
    this.configFolder = configFolder;
    this.HapiPlugins = plugins || [];
  }

  async initConfig() {
    // expose request.app.config
    const plugins = configAdminServer(
      this.logger,
      this.configFileServer,
      this.configFolder
    );
    return this.server.register([plugins.config]);
  }

  async initExternalPlugins() {
    // FEATURE load hapi plugin defined by overrides
    let loadPluginPromises: Array<any> = [];
    if (this.HapiPlugins.length > 0) {
      this.HapiPlugins.forEach(async (plugin: any, index: number) => {
        loadPluginPromises.push(this.server.register(plugin));
      });
    }
    return Promise.all(loadPluginPromises);
  }

  async initCrud() {
    //DOC load routes for prisma CRUD
    const plugins = prisma(
      logger,
      {
        overrides: this.overrides.prismaDefinitionFolder,
      },
      this.config
    );
    //DOC prisma schema is set in package.json
    return this.server.register([plugins.prisma], { once: true });
  }

  async initViews() {
    if (this.config.server.client !== "external") {
      // FEATURE use predefined admin
      await initPugAdmin(this.server, this.overrides, this.config, logger);
    } else {
      await this.server.register(Inert);
      // FEATURE serve ui client
      if (this.config.server.admin.redirect) {
        this.server.route({
          method: "GET",
          options: {
            auth: false,
          },
          path: this.config.server.client.path,
          handler: (_, h: Hapi.ResponseToolkit) => {
            return h.redirect(this.config.server.admin.target).code(307);
          },
        });
      }
      this.server.route({
        method: "GET",
        path: this.config.server.client.path,
        handler: (request, h) =>
          rootViewHandler(h, this.config.server.client.target),
      });
    }
    return;
  }

  async provision() {
    try {
      await this.initConfig();
      await this.server.register([loggerPlugin], { once: true });
      await this.server.register([securityPlugin], { once: true });
      await this.server.register([otherRoutesPlugin], { once: true });
      await this.initExternalPlugins();
      await this.initCrud();// init prisma CRUD
      await this.initViews();// init HTMl rendering
      return this.server;
    } catch (error) {
      console.log(error);
      return this.server;
    }
  }
}

export default AdminServer;
