import { basename } from "node:path";
import { existsSync } from "node:fs";

import { Logger } from "winston";
import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";

import { getValidationRuleForRoute } from "../validation/validators";
import { globSync } from "glob";

const loadRoutesInFolder = async (
  server: Hapi.Server,
  folders: Array<string>,
  logger: Logger,
  config: any
) => {
  let routes = [];
  folders.forEach(async (folder: string) => {
    // get all routes defined in folder
    logger.debug("instanciate routes in folder:" + folder);
    if(!existsSync(folder)) {
        throw Error("folder not existing");
    }
    const definedRoutes: Array<string> = globSync(`${folder}/**/*.ts`);

    // build the Hapi route
    const routesInfolder: Array<
      Promise<Hapi.ServerRoute<Hapi.ReqRefDefaults>>
    > = definedRoutes.map(
      async (route): Promise<Hapi.ServerRoute<Hapi.ReqRefDefaults>> => {
        logger.debug("instanciate route:" + basename(route));
        const currentRoute = await import(route);

        const routeHandlers = currentRoute.handler;
        const routeConfig = currentRoute.config;
        const handlers = (await routeHandlers) as any;
        logger.info(
          `load handler: ${routeConfig.method.toUpperCase()} ${
            routeConfig.path
          }`
        );
        const rules: any = getValidationRuleForRoute(currentRoute);
        const validate =
          Object.keys(rules).length > 0 ? { payload: rules } : null;
        // TODO route validation
        const options = !!validate
          ? { ...routeConfig.options, validate }
          : { ...routeConfig.options };

        const handler: Function = currentRoute.handler;

        return {
          ...routeConfig,
          handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
            try {
              const res = await handler(req, logger, config); // logger DI, config to route handler
              return h.response(res);
            } catch (e) {
              throw Boom.badRequest(e.message);
            }
          },
          options: routeConfig.options,
        };
      }
    );
    await Promise.all(routesInfolder).then((routes) => server.route(routes));
  });
};

export { loadRoutesInFolder };
