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
import type Hapi from "@hapi/hapi";

import excludeFieldsForResultPlugin from "./plugins/excludeFieldsForResultPlugin";

import AdminServer from "./generator";

/**
 * @server HAPI.Server instance
 * @options ServerPluginCrudOptions
 */
const HapiPrismaCrudPlugin = {
  name: "hapi-prisma-crud",
  version: "1.0.0",
  register: async function (server: Hapi.Server, options: ServerConfigOptions) {
    const localServer: AdminServer = new AdminServer(options, server, [
      /* {
        plugin: excludeFieldsForResultPlugin(),
      }, */
      {
        plugin: require("hapi-dev-errors"),
        options: {
          toTerminal: true,
          showErrors: process.env.NODE_ENV !== "production",
        },
      },
    ]);
    const runningServer = await localServer.provision();

    //optionnal
    runningServer.events.on("log", (event, tags) => {
      if (tags.error) {
        console.log(
          `Server error: ${
            event.error ? (event.error as any).message : "unknown"
          }`
        );
      }
    });
    // required
    runningServer.ext({
      type: "onPostStop",
      method: async (server: Hapi.Server) => {
        server.app.prisma.$disconnect();
      },
    });
    // add tracking if needed
    runningServer.ext({
      type: "onRequest",
      method: function (request: Hapi.Request, h: Hapi.ResponseToolkit) {
        console.log(
          "onRequest event:" +
            request.method.toUpperCase() +
            "  " +
            request.path
        );
        return h.continue;
      },
    });
  },
};

export default HapiPrismaCrudPlugin;
