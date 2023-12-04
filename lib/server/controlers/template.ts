import type Hapi from "@hapi/hapi";

const rootViewHandler = (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  path: string
) => {
  return h.file(path + "index.html");
};

export { rootViewHandler };
