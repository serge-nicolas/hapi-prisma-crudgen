/**
 * implement crud handlers/routes
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type Hapi from "@hapi/hapi";
import type { PrismaClient } from "@prisma/client";
import prismaClientInstance from "../../controlers/prismaInstance.ts";

import type {
  PrismaActionMethod,
  HapiDefinedRoute,
} from "../../typings/server.ts";

import configure from "../../common/loadConfig.ts";
import validateFieldsForRoute from "../../validation/fields.ts";
import { ReqRefDefaults, ServerRoute } from "@hapi/hapi";
import { notEmpty } from "../../common/helpers/cleaners.ts";


const config = { ...configure("server"), ...configure("validate") };

/**
 * handle prisma crud routes
 * @param route
 */
const createRoute = async (
  route: PrismaActionMethod,
  resourceName: string,
  prismaClient: PrismaClient
): Promise<HapiDefinedRoute | null> => {
  let path: string = route.action;

  switch (route.method) {
    case "PATCH":
    case "DELETE":
      path = `${route.action}/{id}`;
      break;
  }
  // FEATURE find key in prisma no matter the case
  const _resourceName: any = Object.keys(prismaClient).find((k: string) =>
    k ? k.toLowerCase() === resourceName.toLowerCase() : k
  );
  let resource: any | null = {};
  const resourcePath: string = resolve(
    `./${config.server.path.resources}/${_resourceName}.handler.ts`
  );

  if (existsSync(resourcePath)) {
    resource = (await import(resourcePath)).init(
      _resourceName,
      prismaClient,
      route.action
    );
  } else {
    resource = (await import(`../../models/resource.handler.default.ts`)).init(
      _resourceName,
      prismaClient,
      route.action
    );
  }
  if (resource) {
    // TODO replace custom validation by prima validate
    const definedRoute: HapiDefinedRoute = {
      path,
      method: route.method,
      options: {
        tags: ["api-auto"],
        auth: config.server.auth.default.name,
        validate: {
          payload: config.validate.byRoute[route.action]
            ? validateFieldsForRoute(config.validate.byRoute[route.action])
            : {},
        },
      },
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        try {
          //DOC default to route if no controler defined for this route
          const handler: Function = (
            _resource: {
              buildQuery: (arg0: any) => {
                (): any;
                new (): any;
                execute: { (): any; new (): any };
              };
            },
            _request: Hapi.Request<Hapi.ReqRefDefaults>
          ) => _resource.buildQuery(_request).execute();
         
          const response = await handler(resource, request);
          
          return response;
        } catch (e) {
          throw new Error(e);
        }
      },
    };

    return definedRoute;
  }
  return null;
};

const createRoutes = (
  name: string,
  prismaClient: PrismaClient
): Promise<Array<HapiDefinedRoute | null>> => {
  const routes: Array<PrismaActionMethod> = config.server.prisma.actions;

  let genericRoutes: Array<Promise<HapiDefinedRoute | null>> = [];
  routes.forEach((_route: PrismaActionMethod) => {
    genericRoutes.push(createRoute(_route, name, prismaClient));
  });
  return Promise.all(genericRoutes);
};

const createFullPathForRoute = (route: any): string => {
  return "/api/" + route.name.toLowerCase() + "/" + route.path;
};
/**
 * define routes from prisma schema in independant plugin
 *
 * @param {string} name
 * @return {*}  {Hapi.Plugin<null>}
 */
const init = (name: string): Hapi.Plugin<null> => {
  return {
    name: "app/api/" + name,
    dependencies: ["prisma"],
    register: async function (server: Hapi.Server) {
      const routes: Array<HapiDefinedRoute | null> = await createRoutes(
        name,
        prismaClientInstance
      );
      // BUG ts return null
      const routeList: Array<ServerRoute<ReqRefDefaults>> = routes
        .filter(notEmpty)
        .map((route): ServerRoute<ReqRefDefaults> | undefined => {
          const path: string = createFullPathForRoute({
            path: route.path,
            name,
          });
          if (route) {
            return {
              method: route.method,
              path,
              handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                return route.handler(name, request, h);
              },
            } as ServerRoute<ReqRefDefaults>;
          }

          return undefined;
        })
        .filter(notEmpty);
      server.route(routeList);
    },
  };
};

export default init;

//
// localhost:3000/user/findMany?select={"id":true}&where={"id":"6531287c1151a4838c2f6bd8"}
// http://localhost:3000/authtoken/findMany
