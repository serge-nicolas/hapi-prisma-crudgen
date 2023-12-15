import axios from "axios";
import type { AxiosResponse } from "axios";

import type Joi from "joi";

import {
  findUniqueSchema,
  findManySchemas,
  createSchema,
} from "../validation/schema/query";
const SERVER = `${process.env.API}`;

const getData = async (
  model: string,
  action: string = "findUnique" || "findMany",
  cond?: Object
): Promise<any | null> => {
  let response: AxiosResponse<any>;
  let validatedCond: any = "";
  switch (action) {
    case "findUnique":
      if (!!cond) {
        const schema = findUniqueSchema[model] as Joi.ObjectSchema;
        const { value, error, warning } = schema.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(
        `${SERVER}${model}/${action}?${validatedCond}`
      );
      return response.data;

    case "findMany":
      if (!!cond) {
        const schema = findManySchemas[model] as Joi.ObjectSchema;
        const { value, error, warning } = schema.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(
        `${SERVER}${model}/${action}?${validatedCond}`
      );
      return response.data;

    default:
      break;
  }
  return null;
};

const postData = async (
  model: string,
  action: string = "create",
  data: any | Array<any>
): Promise<any | null> => {
  let response: AxiosResponse<any>;
  let validatedCond: any = "";
  if (!!data) {
    const schema = createSchema[model] as Joi.ObjectSchema;
    const { value, error, warning } = schema.validate(data);
    validatedCond = `where=${JSON.stringify(value)}`;
  }
  response = await axios.get(`${SERVER}${model}/${action}?${validatedCond}`);
};

export { getData, postData };
