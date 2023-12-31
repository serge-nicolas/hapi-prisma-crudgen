import "dotenv/config";
import ServerConfigOptions from "./typings/serverConfigOptions";
import type { Server as HapiServer } from "@hapi/hapi";

import excludeFieldsForResultPlugin from "./plugins/excludeFieldsForResultPlugin";

import AdminServer from "./generator";

const HapiPrismaCrudPlugin = {
  name: "hapi-prisma-crud",
  version: "1.0.0",
  register: async function (server: HapiServer, options: ServerConfigOptions) {
    const localServer = new AdminServer({ ...options, server });
    await localServer.server.register({
      plugin: excludeFieldsForResultPlugin(),
    });
    await localServer.provision();
  },
};

export default HapiPrismaCrudPlugin;
