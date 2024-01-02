import { Server as HapiServer } from "@hapi/hapi";
import Inert from "@hapi/inert"; // DOC needed for frontend

import prisma from "./plugins/prisma";
import configAdminServer from "./plugins/configAdminServer";
import { rootViewHandler } from "./controlers/template";

import type ServerConfigOptions from "./typings/serverConfigOptions";

// securtiy
import type { Logger } from "winston";

import logger from "./common/logger";

import configure from "./common/loadConfig";
import routeHandlers from "./routes";

import initPugAdmin from "../view/register";

class AdminServer {
  config: any;
  server: HapiServer;
  overrides: any;
  HapiPlugins: Array<any>;
  logger: Logger;

  configFileServer: string;
  configFolder: string;

  constructor({
    configFileServer,
    configFolder,
    overrides,
    plugins,
    server,
  }: ServerConfigOptions) {
    console.log("apps", Object.keys(server.app));
    this.logger = server.app.logger;
    this.logger.log("debug", "starting plugin");
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

  async initPlugins() {
    // DOC load hapi plugin defined by overrides
    let loadPluginPromises: Array<any> = [];
    if (this.HapiPlugins.length > 0) {
      this.HapiPlugins.forEach(async (plugin: any, index: number) => {
        loadPluginPromises.push(this.server.register(plugin));
      });
    }
    return Promise.all(loadPluginPromises);
  }

  async withSecurity() {
    /* await this.server.register([this.config.server.auth.default.scheme]);
    const options = this.config.server.auth.default.options;
    options.validate = (
      await import(`./validation/${this.config.server.auth.default.scheme}.ts`)
    ).validate;
    this.server.auth.strategy(
      this.config.server.auth.default.name,
      this.config.server.auth.default.scheme,
      options
    );
    this.server.auth.default(this.config.server.auth.default.name); */
    return;
  }

  async initCrud() {
    //DOC load routes for prisma CRUD
    const plugins = prisma(logger, {
      overrides: this.overrides.prismaDefinitionFolder,
    });
    //DOC prisma schema is set in package.json
    return this.server.register([plugins.prisma], { once: true });
  }

  async initViews() {
    if (this.config.server.client !== "external") {
      // DOC use predefined admin
      await initPugAdmin(this.server, this.overrides);
    } else {
      await this.server.register(Inert);
      // for ui client
      this.server.route({
        method: "GET",
        path: "/",
        handler: (request, h) =>
          rootViewHandler(h, this.config.server.client.path),
      });
    }
    return;
  }

  async initAdditionalRoutes() {
    // other predifined routes for API (upload, graphql, etc)
    const handlers = (await routeHandlers) as any;
    this.logger.info(`loaded handlers: ${Object.keys(handlers).join(", ")}`);

    const routes = this.config.server.hapi.routes.api.map((route: any) => {
      return {
        ...route,
        handler:
          handlers[
            `${(route.method as string).toUpperCase()} ${route.path as string}`
          ],
      };
    });
    this.server.route(routes);
    return;
  }

  displayRoutes() {
    // BUG with blipp
    /* this.logger.log(
      "debug",
      "--- routes ---\n" + !!this.server.plugins.blipp
        ? this.server.plugins.blipp.info()
        : this.server
            .table()
            .map((item) => `${item.method} ${item.fingerprint}`)
    ); */
  }

  async provision() {
    await this.initConfig();
    await this.withSecurity();
    await this.initPlugins();
    await this.initCrud();
    await this.initAdditionalRoutes();
    await this.initViews();

    return this.server;
  }
}

export default AdminServer;
