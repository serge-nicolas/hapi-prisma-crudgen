import type Hapi from "@hapi/hapi";
import type { PrismaActionMethod } from "../../../typings/server";

const handler = async (
  route: PrismaActionMethod,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  console.log(request.payload);
  return h.response("graphql run").code(200);
};

// route config
const config: any = {
  path: `/api/graphql`,
  method: "POST",
  options: {
    auth: false,
  },
};

export { handler, config };
