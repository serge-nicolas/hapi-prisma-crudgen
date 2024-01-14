import { $Enums } from "@prisma/client";

import prismaClientInstance from "../controlers/prismaInstance";
import type { PrismaClient } from "@prisma/client";

import Hapi from "@hapi/hapi";
import type { Logger } from "winston";
import createPluginForModel from "../controlers/createPluginForModel";
import Boom from "@hapi/boom";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

interface DmmfModel {
  name: string;
  fields: Array<object>;
  view: object;
}

interface HapiPlugin {
  prisma: Hapi.Plugin<null>;
}

// FEATURE instantiate Prisma Client
const prismaPlugin = (
  logger: Logger,
  overrides: any,
  config: any
): HapiPlugin => {
  const prismaPlugin: Hapi.Plugin<null> = {
    name: "prisma",
    dependencies: [],
    register: async function (server: Hapi.Server) {
      const prismaClient: PrismaClient = prismaClientInstance;
      //DOC register prismaClient to Hapi
      server.app.prisma = prismaClient;
      //DOC build, DMMF. dataModel not accessible
      //DOC can't use  ModelName  from "@prisma/client" : need more info than a simple list
      const DMMFModels: Array<DmmfModel> = Object.keys(prismaClient)
        .filter((key: string) => !key.includes("_") && !key.includes("$")) // remove non model keys from prisma DMMF
        .map((model: any) => {
          const modelData = prismaClient[model] as any;
          // BUG required not present in DmmfModel

          return {
            name: modelData.$name,
            // not working now? need prisma update, here for next evolution
            fields: Object.keys(modelData.fields).map((field) => ({
              ...modelData.fields[field],
              isReadonly: modelData.fields[field].name === "id" ? true : false,
              shouldHide: config.server.autoFields.includes(
                modelData.fields[field].name
              ),
              isProtected: config.server.protectedFields.includes(
                modelData.fields[field].name
              ),
              isRequired:
                config.server.requiredFields[model]?.includes(
                  modelData.fields[field].name
                ) || false,
              validationPattern: (() => {
                if (config.server.validateFields[model]) {
                  return Object.keys(
                    config.server.validateFields[model]
                  ).includes(modelData.fields[field].name)
                    ? config.server.validateFields[model][
                        modelData.fields[field].name
                      ]
                    : null;
                }
              })(),
            })),
            view: {
              tableFields: config.server.display.table.fieldsByModel[
                modelData.$name
              ]
                ? config.server.display.table.fieldsByModel[modelData.$name]
                    .cols
                : null,
            },
          };
        });

      // FEATURE get actions from prisma
      if (!!!DMMFModels) {
        logger.error("dmmf not defined // prisma model not loaded");
        throw Error("dmmf not defined // prisma model not loaded");
      }

      // DOC add route meta to return full model
      // need cors here
      server.route({
        method: "GET",
        options: {
          auth: config.server.auth.default.name,
        },
        path: config.server.path.admin.target + "/meta",
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          if(!request.auth.isAuthenticated) {
            return Boom.unauthorized();
          }
          return h.response({
            $models: DMMFModels,
            $enums: $Enums,
            sideMenu: JSON.stringify(DMMFModels.map((obj: any) => obj.name)),
          })
        },
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
    },
  };

  return { prisma: prismaPlugin };
};

export default prismaPlugin;
