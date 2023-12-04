import "dotenv/config";
import axios from "axios";
import type { AxiosResponse } from "axios";

import { findUniqueSchema, findManySchemas } from "../validation/schema/query";
const SERVER = `${process.env.API}`;

const getData = async (
  model: string,
  action: string = "findUnique" || "findMany",
  cond?: Object
): Promise<any | null> => {
  if (action == "findUnique") {
    try {
      cond = `where=${JSON.stringify(
        await findUniqueSchema.validateAsync(cond)
      )}`;
      const response: AxiosResponse<any> = await axios.get(
        `${SERVER}${model}/${action}?${cond}`
      );
      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  }
  if (action == "findMany") {
    // one level search
    try {
      let validationResult: any = {};
      let validatedCond: any = "";
      if (!!cond) {
        console.log("🚀 ~ file: api.spec.ts:30 ~ validation:", model, cond);
        validationResult = await findManySchemas[model].validateAsync(cond);
        console.log(
          "🚀 ~ file: api.spec.ts:30 ~ validation:",
          validationResult
        );
        validatedCond = `?where=${JSON.stringify(validationResult)}`;
      }
      console.log("🚀 ~ file: api.spec.ts:40 ~ validatedCond:", validatedCond);

      if (!validationResult.hasOwnProperty("error")) {
        const response: AxiosResponse<any> = await axios.get(
          `${SERVER}${model}/${action}${validatedCond}`
        );
        return response.data;
      }
    } catch (e) {}
  }
  return null;
};

describe("get user", () => {
  let users: Array<any> = [];
  test("should return all users", async () => {
    users = await getData("user", "findMany");
    expect(users.length).toBeGreaterThanOrEqual(0);
  });
  test("should return a random user", async () => {
    const id = users.at(Math.floor(Math.random() * users.length)).id;
    const user = await getData("user", "findUnique", {
      id,
    });
    expect(user.id).toBe(id);
  });
  test("should return users with conditions", async () => {
    const usersByCond = await getData("user", "findMany", {
      id: users.at(Math.floor(Math.random() * users.length)).id,
    });
    expect(usersByCond.length).toBeGreaterThanOrEqual(0);
  });
});
