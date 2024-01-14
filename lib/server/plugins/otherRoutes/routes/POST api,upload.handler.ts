import type Hapi from "@hapi/hapi";

const handler = async (
  route: any,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  console.log(request.payload);
  return h.response("uploaded").code(200);
};

// route config
const config: any = {
  path: `/api/upload`,
  method: "POST",
  options: {
    auth: false,
  },
};

export { handler, config };
