import { join as pathJoin, dirname as pathDirname } from "node:path";

import Pug from "pug";
import Hapi from "@hapi/hapi";

import HapiPrismaCrud from "./lib/server/index";
import translate from "./lib/server/plugins/translate";

import Youch from "youch";
import forTerminal from "youch-terminal";


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);


const viewsPath = pathJoin(__dirname, "lib/view/");

const youchOptions = {
  displayShortPath: false,
  prefix: " ",
  hideErrorTitle: false,
  hideMessage: false,
  displayMainFrameOnly: false,
  framesMaxLimit: 3,
};

const init = async (): Promise<void> => {
  const server = Hapi.server({
    port: process.env.PORT,
    debug: { request: [process.env.NODE_ENV === "production" ? "error" : "*"] },
    host: "localhost",
    routes: {
      cors: {
        origin: [
          "Access-Control-Allow-Origin",
          `localhost:${process.env.PORT}`,
        ],
        headers: ["Accept", "Content-Type"],
      },
    },
  });
  // FEATURE WIP
  await server.register({
    plugin: translate(),
  });

  // FEATURE pretty error reporting, see https://www.npmjs.com/package/hapi-dev-errors
  // BUG: hapi-dev-error must be registered at plugin level
  /*
await server.register({
    plugin: require("hapi-dev-errors"),
    options: {
      toTerminal: true,
      showErrors: process.env.NODE_ENV !== "production",
    },
  }); */

  // FEATURE register the core plugin
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
      },
    },
  });

  try {
    await server.start();
    if (server.info.started) {
      console.info("=== Server running on %s ===", server.info.uri);

      console.info("\nRoutes");

      console.table(
        [
          ...server
            .table()
            .map((route) => ({
              method: route.method,
              model: route.path.replace("/api/", "").split("/")[0],
              type: route.path.split("/")[1],
              URI: route.path,
            }))
            .sort((a, b) => a.model.localeCompare(b.model)),
        ],
        ["method", "model", "URI"]
      );
    }
  } catch (error) {
    throw new Error(error);
  }
};

process.on("unhandledRejection", async (err) => {
  console.error(err);
  const jsonResponse = await new Youch(err, {}).toJSON();
  console.error(forTerminal(jsonResponse, youchOptions));
  process.exit(1);
});

// launch server
(async () => {
  try {
    init();
  } catch (error) {
    const jsonResponse = await new Youch(error, {}).toJSON();
    console.error(forTerminal(jsonResponse, youchOptions));
  }
})();
