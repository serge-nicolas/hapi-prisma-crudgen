/**

 * @returns
 */

import Hapi from "@hapi/hapi";
import logger from "../common/logger";
declare module "@hapi/hapi" {
    interface ServerApplicationState {
      logger: any;
    }
  }

const loggerPlugin = (): any => {
  const plugin: Hapi.Plugin<null> = {
    pkg: {
      name: "logger-middleware",
    },
    register: async function (server: Hapi.Server, options: any) {
       server.app['logger'] = logger;
    },
  };

  return plugin;
};

export default loggerPlugin;
