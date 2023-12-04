/**
 * implement crud handlers/routes
 */

import type Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";
import type { PrismaActionMethod, HapiDefinedRoute } from "../typings/server";

import configure from "../common/loadConfig";
const config = { ...configure("server"), ...configure("validate") };

import routeHandlers from "../routes/index";

import validateFieldsForRoute from "../validation/fields";

import { pathConverter, pathBuilder } from "../common/handlerPathConverter";

type ObjectKey = keyof typeof routeHandlers;

const prismaClient: PrismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
/**
 * handle prisma crud routes
 * @param route
 */
const createRoute = (route: PrismaActionMethod): HapiDefinedRoute => {
  return {
    path: route.action,
    method: route.method,
    options: {
      auth: route.options.auth,
      validate: {
        payload: config.validate.byRoute[route.action]
          ? validateFieldsForRoute(config.validate.byRoute[route.action])
          : {},
      },
    },
    handler: async (
      name: string,
      request: Hapi.Request,
      h: Hapi.ResponseToolkit,
      prisma: PrismaClient
    ) => {

      // DOC find key in prisma no matter the case
      const resource: any = Object.keys(prisma).find((k: string) =>
        k ? k.toLowerCase() === name.toLowerCase() : k
      );
      console.log(Object.keys(prisma[resource]));
      try {
        //DOC default to route if no controler defined for this route
        const handler: Function = (
          await import(
            `../routes/crud/${pathBuilder(
              request.route.method,
              name,
              route.controler || route.action,
              true
            )}.handler`
          )
        ).default;
        const response = await handler(resource, route, request, prisma);
        return h.response(response).code(200);
      } catch (e) {
        return Boom.resourceGone(`${resource} ${route.action}: ${e.message}`);
      }
    },
  };
};

const createRoutes = (route: any): Array<HapiDefinedRoute> => {
  const routes: Array<PrismaActionMethod> = config.server.prisma.actions;

  let genericRoutes: Array<HapiDefinedRoute> = [];
  routes.forEach((_route: PrismaActionMethod) => {
    genericRoutes.push(createRoute(_route));
  });
  return genericRoutes;
};

const createFullPathForRoute = (route: any): string => {
  return "/api/" + route.name.toLowerCase() + "/" + route.path;
};
/**
 * define routes from prisma schema
 *
 * @param {string} name
 * @return {*}  {Hapi.Plugin<null>}
 */
const init = (name: string): Hapi.Plugin<null> => {
  return {
    name: "app/api/" + name,
    dependencies: ["prisma"],
    register: async function (server: Hapi.Server) {
      const routes: Array<any> = createRoutes(name);
      server.route(
        routes.map((route) => ({
          method: route.method,
          path: createFullPathForRoute({ path: route.path, name }),
          handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) =>
            route.handler(name, request, h, prismaClient),
        }))
      );
    },
  };
};

export default init;

//
// localhost:3000/user/findMany?select={"id":true}&where={"id":"6531287c1151a4838c2f6bd8"}
// http://localhost:3000/authtoken/findMany
