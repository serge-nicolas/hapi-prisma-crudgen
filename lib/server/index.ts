/**
 * create the HAPI plugin
 * add any plugins for hapi here
 *
 * HAPI server is a DI
 *
 *
 */

import "dotenv/config";
import ServerConfigOptions from "./typings/serverConfigOptions";
import type { Server as HapiServer } from "@hapi/hapi";

import excludeFieldsForResultPlugin from "./plugins/excludeFieldsForResultPlugin";

import AdminServer from "./generator";

/**
 * @server HAPI.Server instance
 * @options ServerPluginCrudOptions
 */
const HapiPrismaCrudPlugin = {
  name: "hapi-prisma-crud",
  version: "1.0.0",
  register: async function (server: HapiServer, options: ServerConfigOptions) {
    const localServer: AdminServer = new AdminServer({ ...options, server });
    await localServer.server.register([
      {
        plugin: excludeFieldsForResultPlugin(),
      },
      {
        plugin: require("hapi-dev-errors"),
        options: {
          toTerminal: true,
          showErrors: process.env.NODE_ENV !== "production",
        },
      },
    ]);
    await localServer.provision();
  },
};

export default HapiPrismaCrudPlugin;