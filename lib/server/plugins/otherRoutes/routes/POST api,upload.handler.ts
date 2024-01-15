import Boom from "@hapi/boom";
import type Hapi from "@hapi/hapi";

import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

// user -- Uploads image --> Handle Image Upload -- Save Image with custom name --> Save image name to database

import { writeFileSync } from "node:fs";

const handleFileUpload = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const file = writeFileSync("./upload/test.png", file);
    } catch (e) {
      return Boom.badRequest();
    }
  });
};

const handler = async (
  route: any,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  try {
    console.log(route);

    /* await pipeline(
    request,
    fs.createWriteStream("archive.tar.gz")
  ); */

    const { payload } = request;
    console.log("payload", payload);
    //handleFileUpload(payload.file);
    return h.response("uploaded").code(200);
  } catch (error) {
    console.log(error);
  }
};

// route config
const config: any = {
  path: `/api/file/{action}`,
  method: "POST",
  options: {
    payload: {
      maxBytes: 1048576 * 10, // 10MB
      output: "stream",
      parse: false,
      allow: "multipart/form-data",
    },
  },
};

export { handler, config };
