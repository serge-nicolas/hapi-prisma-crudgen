import Joi from "joi";
import prismaClientInstance from "../controlers/prismaInstance";
import type { PrismaClient } from "@prisma/client";

import * as val from "./prisma/type";

import { validators } from "./validators";

import { removeEmptyOrUndefinedValueFromObject } from "../common/helpers/cleaners";

import configure from "../common/loadConfig";
const config: any = configure("validate");

type FieldWithType = {
  name: string;
  type: string;
};

// must validate query against prisma schema
interface DmmfModel {
  name: string;
  fields: Array<FieldWithType>;
}
const prismaClient: PrismaClient = prismaClientInstance;
const DMMFModels: Array<DmmfModel> = Object.keys(prismaClientInstance)
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
let findManySchemasByModel: any = {};

if (DMMFModels.length < 0) {
  throw Error("DMMF Model not loaded");
}

DMMFModels.forEach((model): any => {
  let validatorsForFields: any = {};
  model.fields.forEach((field) => {
    const joiObject = (val as any)[`${field.type}Schema`];
    if (typeof joiObject === "object") {
      validatorsForFields[field.name] = joiObject;
    }
  });
  findManySchemasByModel[model.name] = Joi.object(validatorsForFields).min(1);
});

const paginateSchema = (model: string): any => {
  return Joi.object({
    from: validators.from,
    length: validators.length,
  });
};

const findUniqueSchema = (model: string): any => {
  return Joi.object({
    id: validators.asObjectId,
  });
};

const createSchema = (model: string): any => {
  // set from config the fields needed
  console.log("validate", config.validate.byModel);
  if(Object.keys(config.validate).includes(model)) {
    const schema: any = Object.keys(config.validate[model]).map(
      (item: any) => ({
        [item]:
          validators[
            config.validate.byModel[model][item] as keyof typeof validators
          ],
      })
    );
    const preparedSchema: any = Object.assign({}, ...schema);
    return Joi.object(removeEmptyOrUndefinedValueFromObject(preparedSchema));
  } 
  return true;
};

const findManySchemas = (model: string): any => {
  return findManySchemasByModel[model];
};

export { paginateSchema, findUniqueSchema, findManySchemas, createSchema };
