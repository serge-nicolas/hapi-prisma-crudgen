import Hapi from "@hapi/hapi";

import type { Logger } from "winston";

import configure from "../common/loadConfig";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    config: any;
  }
}

interface HapiPlugin {
  config: Hapi.Plugin<null>;
}

/**
 * set config sever.app.config
 * @param logger
 * @param configFileServer
 * @param configFolder
 * @returns
 */

const configPlugin = (
  logger: Logger,
  configFileServer: string,
  configFolder: any
): HapiPlugin => {
  const configPlugin: Hapi.Plugin<null> = {
    name: "config",
    register: async function () {
      return configure(configFileServer, configFolder);
    },
  };

  return { config: configPlugin };
};

export default configPlugin;
