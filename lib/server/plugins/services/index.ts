/**
 * workflow :
 * - (TODO) create a task item with params : source model, id, options, result model
 * - (TODO) create a job
 * - execute job
 * - (TODO) store task results
 * - (TODO) update source model with needed results
 */
import { Dirent, PathLike, readdirSync } from "node:fs";

import Hapi from "@hapi/hapi";

import { initQueue } from "./helpers";
import bullboard from "./bullboard";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
  }
}

type Service = {
  name: string;
  callback: Function;
};

type Options = {
  services: Array<Service>;
  withBullBoard: Boolean;
};

const servicePlugin: Hapi.Plugin<null> = {
  name: "services",
  dependencies: ["prisma", "logger"],
  register: async function (
    server: Hapi.Server,
    options: Options
  ): Promise<void> {
    const logger = server.app.logger;
    const withBullBoard = options.withBullBoard;
    if (options.services) {
      if (withBullBoard) server.register([bullboard]);
      // create queues for a service
      options.services.forEach(async (service: Service) => {
        logger.info(`Service ${service.name.toLocaleUpperCase()} starting...`);
        try {
          const importedService = await initQueue(
            service,
            logger,
            service.callback
          );
          logger.info(
            `{${service.name.toLocaleUpperCase()}} is listening on ${
              process.env.REDIS_PORT
            }`
          );
          logger.info(importedService);
        } catch (error) {
          logger.error(error);
        }
      });
    } else {
      const directories = (source: PathLike) =>
        readdirSync(source, {
          withFileTypes: true,
        }).reduce((a: Array<String>, c: Dirent) => {
          c.isDirectory() && a.push(c.name);
          return a;
        }, []);
      logger.info(
        "no services defined, services availables: " +
          JSON.stringify(directories(__dirname))
      );
    }
    return;
  },
};

export default servicePlugin;
