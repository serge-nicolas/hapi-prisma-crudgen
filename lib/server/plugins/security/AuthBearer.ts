import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import AuthBearer from "hapi-auth-bearer-token";

import prismaClientInstance from "../../controlers/prismaInstance";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    config: any;
  }
}

type JwtToken = {
  decodedJWT: any;
};

const validate = async (
  request: Hapi.Request,
  token: any,
  h: Hapi.ResponseToolkit
) => {
  let isValid = false,
    credentials = {},
    artifacts = { error: {}, info: {} };
  // TODO create a type of request containing app.prisma
  try {
    if (!token) {
      // jwt token not good
      console.log("no token");
      return Boom.unauthorized();
    }

    // check if token exists
    const users = await prismaClientInstance.userTempProxy.findMany({
      where: {
        authtoken: token,
      },
      select: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (users.length < 1) {
      artifacts.error = "KO";
      isValid = false;
    } else {
      credentials = {
        ...users[0],
      };
      isValid = true;
      artifacts.info = "OK";
    }
    return { isValid, credentials, artifacts };
  } catch (error) {
    // return Boom.unauthorized();
    //return { isValid, credentials, artifacts };
    throw Error(error);
  }
};

const init = async (
  server: Hapi.Server,
  config: any,
  asDefaultStrategy: Boolean = true
) => {
  await server.register([AuthBearer]);
  server.auth.strategy(config.server.auth.default.name, "bearer-access-token", {
    allowCookieToken: false,
    validate,
    unauthorized: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const ip = request;
      console.log(ip);
      return Boom.forbidden();
    },
  });
  if (asDefaultStrategy) server.auth.default(config.server.auth.default.name);
};

export { init };
