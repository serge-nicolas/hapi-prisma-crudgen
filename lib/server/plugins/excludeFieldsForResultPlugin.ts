/**
*  TO REMOVE
 * @returns
 */

import Hapi from "@hapi/hapi";

import { excludeFieldsForResult } from "../common/filterResults";
declare module "@hapi/hapi" {
  interface ServerApplicationState {
    excludeFieldsForResult: any;
    config: any;
  }
}

const excludeFieldsForResultPlugin = (): any => {
  const plugin: Hapi.Plugin<null> = {
    pkg: {
      name: "excludeFieldsForResult",
    },
    register: async function (server: Hapi.Server, options: any) {
      // TODO set the the correct type for request (with .source)
      server.ext("onPreResponse", (request: any, h: Hapi.ResponseToolkit) => {
        if(!request.route.path.includes("api")) {
          // exclude all other routes (not array of items)
          return h.continue;
        }
        
        let response: any = request.response;

        if (response.isBoom) {
          return null;
        }
        // FEATURE exclude not items data files etc.
        if (response.source && !response.source.context?.itemData) {
          const sourceItemData: Array<any> = response.source;

          if (sourceItemData.hasOwnProperty("length")) {
            //is array (ie findMany route)
            const itemData = excludeFieldsForResult(
              sourceItemData,
              server.app.config.server.protectedFields
            );
            request.response.source = itemData;
            return h.continue;
          }
          // has one result (ie edit route)
          const itemData = excludeFieldsForResult(
            [sourceItemData],
            server.app.config.server.protectedFields
          );
          request.response.source = itemData.at(0);
          return h.continue;
        }

        return h.continue;
      });
    },
  };

  return plugin;
};

export default excludeFieldsForResultPlugin;
