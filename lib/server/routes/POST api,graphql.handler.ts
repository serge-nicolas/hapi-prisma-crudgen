import type Hapi from "@hapi/hapi";
import type { PrismaActionMethod } from "../typings/server";

export default async (
  route: PrismaActionMethod,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  console.log(request.payload);
  return h.response("graphql run").code(200);
};
