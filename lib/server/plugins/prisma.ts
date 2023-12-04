import { PrismaClient, $Enums } from "@prisma/client";

import Hapi from "@hapi/hapi";
import type { Logger } from "winston";
import createPluginForModel from "../controlers/createPluginForModel";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

interface DmmfModel {
  name: string;
  dbName: string;
  fields: Array<object>;
  primaryKey: string;
  uniqueFields: Array<Array<string>>;
  uniqueIndexes: Array<Array<object>>;
  isGenerated: boolean;
}

interface HapiPlugin {
  prisma: Hapi.Plugin<null>;
}

// DOC instantiate Prisma Client
const prismaPlugin = (logger: Logger, overrides: any): HapiPlugin => {
  const prismaPlugin: Hapi.Plugin<null> = {
    name: "prisma",
    dependencies: ["logger-middleware", "i18n-middleware"],
    register: async function (server: Hapi.Server) {
      const prismaClient: PrismaClient = new PrismaClient({
        log: [
          { level: "warn", emit: "event" },
          { level: "info", emit: "event" },
          { level: "error", emit: "event" },
        ],
      });
      //DOC register prismaClient to Hapi
      server.app.prisma = prismaClient;

      //DOC build, DMMF. dataModel not accessible
      const DMMFModels: Array<DmmfModel> = Object.keys(prismaClient)
        .filter((key: string) => !key.includes("_") && !key.includes("$"))
        .map((model: any) => {
          const modelData = prismaClient[model] as any;
          return {
            name: modelData.$name,
            // not working now? need prisma update, here for next evolution
            fields: modelData.fields,
            dbName: modelData.dbName,
            primaryKey: modelData.primaryKey,
            uniqueFields: modelData.uniqueFields,
            uniqueIndexes: modelData.uniqueIndexes,
            isGenerated: modelData.isGenerated,
          };
        });

      // DOC get actions from prisma
      if (!!!DMMFModels) {
        logger.error("dmmf not defined // prisma model not loaded");
        throw Error("dmmf not defined // prisma model not loaded");
      }

      //DOC add route meta to return full model
      server.route({
        method: "GET",
        path: "/meta",
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => ({
          $models: DMMFModels,
          $enums: $Enums,
          sideMenu: JSON.stringify(DMMFModels.map((obj: any) => obj.name)),
        }),
      });

      //DOC init each model as plugin
      await Promise.all(
        DMMFModels.map(async (model: any) => {
          logger.info(`prisma:creating plugin: ${model.name}`);
          if (model.name !== undefined) {
            await server.register(createPluginForModel(model.name));
          }
        })
      );
      logger.info("prisma init done");

      server.ext({
        type: "onPostStop",
        method: async (server: Hapi.Server) => {
          server.app.prisma.$disconnect();
        },
      });
      server.ext({
        type: "onRequest",
        method: function (request: Hapi.Request, h: Hapi.ResponseToolkit) {
          logger.debug(request.path);
          return h.continue;
        },
      });
    },
  };

  return { prisma: prismaPlugin };
};

export default prismaPlugin;
