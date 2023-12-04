import Joi from "joi";
import { PrismaClient, $Enums } from "@prisma/client";

import * as val from "../fromPrismaType";

const paginateSchema = Joi.object({
  from: Joi.number().required(),
  length: Joi.number(),
});

const findUniqueSchema = Joi.object({
  id: Joi.string().required(),
});

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
  const validatorsForFields = model.fields.map((field) => {
    const joiObject = (val as any)[`${field.type}Schema`];
    if (typeof joiObject === "object") {
      return {
        [field.name]: joiObject,
      };
    }
    return null;
  });
  findManySchemas[model.name] = Joi.object(validatorsForFields).min(1);
});
console.log("🚀 ~ file: query.ts:59 ~ DMMFModels.forEach ~ findManySchemas:", Object.keys(findManySchemas));

export { paginateSchema, findUniqueSchema, findManySchemas };
