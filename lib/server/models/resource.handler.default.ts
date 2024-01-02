import type { PrismaClient } from "@prisma/client";
import Resource from "./resource";

const rules: any = {
  password: {
    needs: {},
    compute() {
      return undefined;
    },
  },
};

const init = (
  name: string,
  prisma: PrismaClient,
  action: string
): Resource | null => {
  try {
    const currentResource: Resource = new Resource(name, prisma, action, rules);
    //DOC hooks executed in order (use promise.all)
    currentResource.setBeforeHooks([]);
    currentResource.setAfterHooks([]);
    return currentResource;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export { init };
