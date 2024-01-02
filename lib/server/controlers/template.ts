import type Hapi from "@hapi/hapi";

const rootViewHandler = (
  h: Hapi.ResponseToolkit,
  path: string
) => {
  return h.file(path + "index.html");
};

export { rootViewHandler };
