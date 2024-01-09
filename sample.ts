import { join as pathJoin } from "node:path";

import Pug from "pug";
import Hapi from "@hapi/hapi";

import HapiPrismaCrud from "./lib/server/index";
import translate from "./lib/server/plugins/translate";
import logger from "./lib/server/plugins/logger";

import Youch from "youch";
import forTerminal from "youch-terminal";

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
    host: "localhost",
    routes: {
     
      cors: {
        origin: ["Access-Control-Allow-Origin", `localhost:${process.env.PORT}`],
        headers: ["Accept", "Content-Type"],
      },
    },
  });
  // FEATURE install logger in app.logger
  await server.register({
    plugin: logger(),
  });
  // FEATURE WIP
  await server.register({
    plugin: translate(),
  });

  /*
// FEATURE pretty error reporting, see https://www.npmjs.com/package/hapi-dev-errors
// BUG: hapi-dev-error must be registered at plugin level  
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
    console.log("start server");
    await server.start();
    console.group("server");
    console.info(
      "=== Server running on %s ===",
      server.info.uri,
      "\nroutes",
      server.table().map((route) => `${route.method}: ${route.path}`)
    );
    console.groupEnd();
  } catch (error) {
    throw new Error(error);
  }
};

process.on("unhandledRejection", async (err) => {
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
