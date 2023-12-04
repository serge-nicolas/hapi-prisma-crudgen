import { join as pathJoin } from "node:path";

import Pug from "pug";
import Hapi from "@hapi/hapi";

import HapiPrismaCrud from "./lib/server/index";
import translate from "./lib/server/plugins/translate";
import logger from "./lib/server/plugins/logger";

const viewsPath = pathJoin(__dirname, "lib/views/");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: "localhost",
    debug: { request: ["error"] },
    routes: {
      files: {
        relativeTo: pathJoin(__dirname, "dist"),
      },
    },
  });
  // DOC install logger in app.logger
  await server.register({
    plugin: logger(),
  });
  // DOC WIP
  await server.register({
    plugin: translate(),
  });

  await server.register({
    plugin: HapiPrismaCrud,
    options: {
      configFileServer: "server",
      configFolder: "./config/",
      overrides: {
        views: {
          engines: { pug: Pug },
          layoutPath: `${viewsPath}/layout`,
          helpersPath: `${viewsPath}/lib`,
          path: viewsPath,
          compileOptions: {
            pretty: false,
            doctype: "html",
          },
        },
        once: true,
      }
    },
  });

  await server.start();

  return server;
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init()
  .then((server) => {
    console.group("start server");
    console.info(
      "=== Server running on %s ===",
      server.info.uri,
      "\nroutes",
      server.table().map((route) => `${route.method}: ${route.path}`)
    );
    console.groupEnd();
  })
  .catch((err) => {
    console.log(err);
  });
