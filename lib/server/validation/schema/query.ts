import Joi from "joi";
import { PrismaClient, $Enums } from "@prisma/client";

import * as val from "../prisma/type";

const paginateSchema = (():any=> {
  return Joi.object({
    from: Joi.number().required(),
    length: Joi.number(),
  });
})()

const findUniqueSchema = (():any=> {
  return Joi.object({
    id: Joi.string().required(),
  })
})();

const createSchema = (():any => {
  // set from config the field needed
})();

const findManySchemas = (() => {
  type FieldWithType = {
    name: string;
    type: string;
  };

  // must validate query against prisma schema
  interface DmmfModel {
    name: string;
    fields: Array<FieldWithType>;
  }
  const prismaClient: PrismaClient = new PrismaClient();
  const DMMFModels: Array<DmmfModel> = Object.keys(prismaClient)
    .filter((key: string) => !key.includes("_") && !key.includes("$"))
    .map((model: any) => {
      const modelData = prismaClient[model] as any;
      const modelFields = Object.keys(modelData.fields).map(
        (key: string): FieldWithType => {
          return {
            name: modelData.fields[key].name,
            type: modelData.fields[key].typeName,
          };
        }
      );
      return {
        name: modelData.$name.toLowerCase(),
        fields: modelFields,
      };
    });
  /**
   * return object[model][field] as Joi schema
   */
  let findManySchemas: any = {};
  DMMFModels.forEach((model): any => {
    let validatorsForFields: any = {};
    model.fields.forEach((field) => {
      const joiObject = (val as any)[`${field.type}Schema`];
      if (typeof joiObject === "object") {
        validatorsForFields[field.name] = joiObject;
      }
    });
    findManySchemas[model.name] = Joi.object(validatorsForFields).min(1);
  });
  return findManySchemas;
})();

export { paginateSchema, findUniqueSchema, findManySchemas, createSchema };
