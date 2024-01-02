import type { PrismaClient } from "@prisma/client";
import Resource from "../../lib/server/models/resource";
import type Hapi from "@hapi/hapi";

import { excludeFieldsForResult } from "../../lib/server/common/filterResults";

class ExtendedResource extends Resource {
  constructor(name: string, prisma: PrismaClient, action: string) {
    super(name, prisma, action, {
      password: {
        needs: {},
        compute() {
          return undefined;
        },
      },
    });
  }
}

const init = (name: string, prisma: PrismaClient, action: string): Resource => {
  const currentResource: Resource = new ExtendedResource(name, prisma, action);
  //DOC executed in order (use promise.all)
  currentResource.setBeforeHooks([]);
  currentResource.setAfterHooks([]);
  return currentResource;
};

export { init };
