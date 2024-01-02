import axios from "axios";
import type { AxiosResponse } from "axios";

import type Joi from "joi";

import {
  findUniqueSchema,
  findManySchemas,
  createSchema,
} from "../validation/query";

const API = `${process.env.API}`;

const getData = async (
  model: string,
  action: string = "findUnique" || "findMany",
  cond?: Object
): Promise<AxiosResponse> => {
  let response: AxiosResponse<any>;
  let validatedCond: any = "";
  switch (action) {
    case "findUnique":
      if (!!cond) {
        const schema = findUniqueSchema(model) as Joi.ObjectSchema;
        const { value, error, warning } = schema.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(`${API}${model}/${action}?${validatedCond}&select=${JSON.stringify({
        id: true,
        email: true,
      })}`);
      return response;

    case "findMany":
      if (!!cond) {
        const schema = findManySchemas(model) as Joi.ObjectSchema;
        const { value, error, warning } = schema.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(`${API}${model}/${action}?${validatedCond}`);
      return response;

    default:
      break;
  }
  return null;
};

const createData = async (
  model: string,
  action: string = "create",
  data: any | Array<any>
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = createSchema(model) as Joi.ObjectSchema;
    const { value, error, warning } = schema.validate(data);
    try {
      return await axios.put(`${API}${model}/${action}`, value);
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const postData = async (
  model: string,
  action: string = "createMany",
  data: any | Array<any>
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = createSchema(model) as Joi.ObjectSchema;
    const { value, error, warning } = schema.validate(data);
    try {
      return await axios.post(`${API}${model}/${action}`, value);
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const deleteUnique = async (
  model: string,
  action: string = "delete",
  data: any | Array<any>
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = findUniqueSchema(model) as Joi.ObjectSchema;
    try {
      const { value, error, warning } = schema.validate(data);
      console.log("++++", value);
      return await axios.delete(`${API}${model}/${action}/${value.id}`);
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const updateUnique = async (
  model: string,
  action: string = "update",
  data: any | Array<any>
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = findUniqueSchema(model) as Joi.ObjectSchema;
    try {
      const { value, error, warning } = schema.validate(data);
      const id = value.id;
      delete value.id;
      return await axios.patch(
        `${API}${model}/${action}/${id}?select=${JSON.stringify({
          id: true,
          email: true,
        })}`,
        value
      );
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

export { getData, postData, deleteUnique, updateUnique, createData };
