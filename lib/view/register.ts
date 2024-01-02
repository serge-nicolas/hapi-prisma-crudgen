import Vision from "@hapi/vision"; // DOC needed for pug frontend
import Inert from "@hapi/inert";
import Wreck from "@hapi/wreck";

import type Hapi from "@hapi/hapi";

import { join as pathJoin } from "node:path";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
  }
}

const initPugAdmin = async (server: Hapi.Server, overrides: any) => {
  // serve pug files
  await server.register(Vision);
  server.views(overrides.views);
  const logger = server.app.logger;
  const path: string = `${overrides.root}/{params*}`;
  server.route({
    method: "GET",
    path,
    options: {
      handler: async (req, h) => {
        let params: Array<string> = [];
        // DOC parse req params to find page, id...
        console.log(req.params);
        if (req.params.includes("/")) params = req.params.split("/");
        console.log(params);
        const metaResponse: Hapi.ServerInjectResponse = await server.inject({
          method: "GET",
          url: "/meta",
        });
        let itemData: any = {};
        if (!!params[2] && !!params[0] && !!params[1]) {
          switch (params[1]) {
            case "edit":
              params[1] = "findUnique";
              break;
          }

          const { res, payload } = await Wreck.get(
            `${process.env.API}${params[0].toLowerCase()}/${
              params[1]
            }?where={"id":"${params[2]}"}`
          );

          itemData = JSON.parse((payload as any).toString());
        }
        const page = !!params[2] ? "edit" : "view";
        return h.view("admin", {
          meta: JSON.parse(metaResponse.payload),
          action: req.params[1] || null,
          id: req.params[2] || null,
          page,
          itemData,
        });
      },
    },
  });
  // serve assets
  await server.register(Inert);
  server.route({
    method: "GET",
    path: `/assets/{param*}`,
    handler: {
      directory: {
        path: pathJoin(__dirname, "..", "..", "dist", "assets"),
        redirectToSlash: true,
        index: false,
        listing: true,
      },
    },
  });
  server.route({
    method: "GET",
    path: "/lib/{param*}",
    handler: {
      directory: {
        path: pathJoin(__dirname, "lib"),
        redirectToSlash: true,
        index: false,
        listing: true,
      },
    },
  });
};

export default initPugAdmin;
