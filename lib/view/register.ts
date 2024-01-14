/**
 * Hold the admin specific logic to register admin as HAPI plugin.
 * - add specific routes for HAPI
 * - add HAPI plugins
 *
 *
 * route, query etc are specific to the framework used
 *
 * in this configuration, page is reload and data loaded in
 *
 *
 * Defined routes for JS/assets
 */

import Vision from "@hapi/vision"; // FEATURE needed for pug frontend
import Inert from "@hapi/inert";

import type { Logger } from "winston";
import Hapi from "@hapi/hapi";

import { join as pathJoin, resolve as pathResolve } from "node:path";
import {
  existsSync as fsExistsSync,
  readFileSync as fsReadFileSync,
} from "node:fs";
import { pathToRegexp, parseQuery } from "./lib/common/routeParse";

const idCheck: RegExp = /^[0-9a-fA-F]{24}$/;

type RouteModelComplete = {
  model: string;
  action: string | null;
  query?: any;
};
type RouteModel = {
  model: string;
  action: string;
};

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
  }
}

const initPugAdmin = async (
  server: Hapi.Server,
  overrides: any,
  config: any,
  logger: Logger
) => {
  // serve static files
  await server.register(Vision);
  server.views(overrides.views);
  // add proxy to file handler to rewrite js files
  const path: string = `${config.server.path.admin.target}/{path*}`;
  logger.debug("registering plugin view", path);
  server.route({
    method: "GET",
    path,
    handler: async (
      request: Hapi.Request<Hapi.ReqRefDefaults>,
      h: Hapi.ResponseToolkit
    ) => {
      console.log("isAuthenticated", request.auth.isAuthenticated);
      //LINK sample http://localhost:3002/admin/User/edit?where={"id":"6531287c1151a4838c2f6bd9"}
      let page: string = "";
      let itemData: any = {};
      logger.debug("route reached: " + request.path);
      logger.debug("route reached query: " + request.query.where);

      const parsedQuery: any =
        !!request.query && !!request.query.where
          ? JSON.parse(request.query.where)
          : null;

      // derivate object route from path
      let currentRouteModel: RouteModelComplete = {
        ...(pathToRegexp(
          `/${config.server.path.admin.target}/:model/:action`,
          request.path
        ) as RouteModel),
        query: parsedQuery,
      } as RouteModelComplete;

      // TODO add validation schema/query from tests
      // if query.id not defined use findMany
      switch (currentRouteModel.action) {
        case "edit":
          if (currentRouteModel && currentRouteModel.query?.id) {
            if (currentRouteModel.query?.id.match(idCheck)) {
              currentRouteModel.action = "findUnique";
            } else {
              throw Error("id provided not good");
            }
          } else {
            currentRouteModel.action = null;
          }
          break;
        case "list":
          currentRouteModel.action = "findMany";
          break;
      }
      // FEATURE add meta to all request results
      /* const metaResponse: Hapi.ServerInjectResponse = await server.inject({
        method: "GET",
        url: `${process.env.META}`,
      }); */

      if (!!currentRouteModel.action) {
        // add query to route model, accessible from view
        const queryAppendix: string | null = currentRouteModel.query
          ? Object.keys(currentRouteModel.query)
              .map((q: any) => {
                if (currentRouteModel.query)
                  return JSON.stringify({
                    [q]: currentRouteModel.query[q] || null,
                  });
              })
              .filter((value) => value !== null)
              .join("&")
          : null;

        let url: string = `/api/${currentRouteModel.model.toLowerCase()}/${
          currentRouteModel.action
        }`;

        if (queryAppendix) url = `${url}?where=${queryAppendix}`;

        const { payload } = await server.inject({
          method: "GET",
          url,
          auth: {
            credentials: {},
            strategy: config.server.auth.default.name,
          },
          allowInternals: true,
        });

        itemData = JSON.parse((payload as any).toString());
        console.log(itemData);
      }
      const view = {
        // meta: JSON.parse(metaResponse.payload),
        route: currentRouteModel,
        action: currentRouteModel.action || null, // TODO deprecate
        id: (currentRouteModel as RouteModelComplete).query?.id || null,
        page,
        itemData,
        debug: false,
      };

      return h.view("admin", view);
    },
  });
  // set the route to public zone
  server.route({
    method: "GET",
    path: "/",
    options: {
      auth: false,
    },
    handler: (
      request: Hapi.Request<Hapi.ReqRefDefaults>,
      h: Hapi.ResponseToolkit
    ) => {
      // redirect or HTML content
      // return h.redirect(config.server.path.admin.target).code(307);
      return h.response(`<a href="${server.info.uri}/admin">Go to admin</a>`);
    },
  });

  await server.register(Inert);
  server.route({
    method: "GET",
    options: {
      auth: false,
    },
    path: `${config.server.path.assets.target}/redeem`,
    handler: async (
      request: Hapi.Request<Hapi.ReqRefDefaults>,
      h: Hapi.ResponseToolkit
    ) => {
      let url: string = `/api/login?redeem_code=${request.params.code}`;
      const { payload } = await server.inject({
        method: "POST",
        url,
      });
    },
  });
  // FEATURE serve static assets/libs
  await server.register(Inert);
  server.route({
    method: "GET",
    path: `${config.server.path.assets.target}/{param*}`,
    options: {
      auth: false,
    },
    handler: {
      directory: {
        path: pathJoin(__dirname, "..", "..", config.server.path.assets.folder),
        redirectToSlash: true,
        index: false,
        listing: true,
      },
    },
  });
  // FEATURE serve lib js assets
  // replace process.env by config.server.path for JS files
  server.route({
    method: "GET",
    path: `${config.server.path.lib.target}/{file*}`,
    options: {
      auth: false,
    },
    handler: function (
      request: Hapi.Request<Hapi.ReqRefDefaults>,
      h: Hapi.ResponseToolkit
    ) {
      const filePath = pathResolve(`./lib/view/lib/${request.params.file}`);
      if (fsExistsSync(filePath)) {
        const data = fsReadFileSync(filePath, "utf8");
        return h
          .response(
            data
              .replace("process.env.LIB", config.server.path.lib)
              .replace("process.env.META", `"${process.env.META}"`)
              .replace("process.env.API", `"${process.env.API}"`)
              .replace("process.env.ASSETS", `"${process.env.ASSETS}"`)
          )

          .type("text/javascript");
      }
      return h.response().code(204);
    },
  });
};

export default initPugAdmin;
