import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";

import type Joi from "joi";

import {
  findUniqueSchema,
  findManySchemas,
  createSchema,
} from "../validation/query";

// TODO priority 1 : add bearer
// headers: { authorization: `Bearer ${jwt}` },

const API = `${process.env.API}`;
// for extended api
const API_EXT = `${process.env.API_EXT}`;

const getData = async (
  model: string,
  action: string = "findUnique" || "findMany",
  cond?: Object,
  headers: any = null
): Promise<AxiosResponse> => {
  let response: AxiosResponse<any>;
  let validatedCond: any = "";
  switch (action) {
    case "findUnique":
      if (!!cond) {
        const schema = findUniqueSchema(model) as Joi.ObjectSchema;
        const { value, error, warning } = schema
          ? { value: cond, error: {}, warning: {} }
          : schema?.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(
        `${API}${model}/${action}?${validatedCond}&select=${JSON.stringify({
          id: true,
          email: true,
        })}`,
        {
          headers,
        }
      );
      return response;

    case "findMany":
      if (!!cond) {
        const schema = findManySchemas(model) as Joi.ObjectSchema;
        const { value, error, warning } = schema.validate(cond);
        validatedCond = `where=${JSON.stringify(value)}`;
      }
      response = await axios.get(`${API}${model}/${action}?${validatedCond}`, {
        headers,
      });
      return response;

    default:
      break;
  }
  return null;
};

const createData = async (
  model: string,
  action: string = "create",
  data: any | Array<any>,
  headers: any = null
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = createSchema(model) as Joi.ObjectSchema;
    const { value, error, warning } = schema
      ? { value: data, error: {}, warning: {} }
      : schema?.validate(data);
    try {
      console.log(value);
      return await axios.put(
        `${API}${model}/${action}`,
        { data: value },
        {
          headers,
        }
      );
    } catch (e: any) {
      if ((e as AxiosError).response.status !== 500) throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const postData = async (
  model: string,
  action: string = "createMany",
  data: any | Array<any>,
  headers: any = null
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = createSchema(model) as Joi.ObjectSchema;
    console.log(schema, model);
    const { value, error, warning } = schema
      ? { value: data, error: {}, warning: {} }
      : schema?.validate(data);
    try {
      return await axios.post(`${API}${model}/${action}`, value, {
        headers,
      });
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
  data: any | Array<any>,
  headers: any = null
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = findUniqueSchema(model) as Joi.ObjectSchema;
    try {
      const { value, error, warning } = schema
        ? { value: data, error: {}, warning: {} }
        : schema?.validate(data);
      console.log("++++", value);
      return await axios.delete(`${API}${model}/${action}/${value.id}`, {
        headers,
      });
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
  data: any | Array<any>,
  headers: any = null
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = findUniqueSchema(model) as Joi.ObjectSchema;
    try {
      const { value, error, warning } = schema
        ? { value: data, error: {}, warning: {} }
        : schema?.validate(data);
      const id = value.id;
      delete value.id;
      return await axios.patch(
        `${API}${model}/${action}/${id}?select=${JSON.stringify({
          id: true,
          email: true,
        })}`,
        value,
        {
          headers,
        }
      );
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const userLoginRedeem = async (code: string): Promise<AxiosResponse> => {
  if (!!code) {
    try {
      return await axios.post(`${API}login?redeem_code=${code}`);
    } catch (e) {
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

const userLogin = async (
  model: string,
  data: any | Array<any>
): Promise<AxiosResponse> => {
  if (!!data) {
    const schema = findManySchemas(model) as Joi.ObjectSchema;
    try {
      const { value, error, warning } = schema
        ? { value: data, error: {}, warning: {} }
        : schema?.validate(data);
      return await axios.post(`${API_EXT}login`, value);
    } catch (e) {
      console.log(`${API_EXT}login`);
      throw Error(e);
    }
  } else {
    throw Error("no data");
  }
};

export {
  getData,
  postData,
  deleteUnique,
  updateUnique,
  createData,
  userLogin,
  userLoginRedeem,
};
