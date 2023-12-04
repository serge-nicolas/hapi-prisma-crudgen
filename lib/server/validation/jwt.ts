import type Hapi from "@hapi/hapi";

import Boom from "@hapi/boom";

import { PrismaClient } from "@prisma/client";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    config: any;
  }
}

const validate = async (
  decoded: any,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const prisma: PrismaClient = (request.app as any).prisma; // TODO creeate a type of request containing app.prisma
  if (!!!decoded.id) {
    // jwt token not good
    return Boom.unauthorized();
  }
  const users = await prisma.user.findMany({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
    },
  });
  if (!users.length) return Boom.unauthorized();
  else h.continue; // set the cookie with options
};

export { validate };
