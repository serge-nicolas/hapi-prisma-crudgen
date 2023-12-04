import type Hapi from "@hapi/hapi";
import type { PrismaActionMethod } from "../../typings/server";
import type { PrismaClient } from "@prisma/client";

import { removeEmptyObjectForPrismaQUery } from "../../common/query";

interface PrismaQuery {
  select: any;
  where: any;
}

export default async (
  name: String,
  route: PrismaActionMethod,
  request: Hapi.Request,
  prisma: PrismaClient
) => {
  const select: any = !!request.query?.select
    ? JSON.parse(request.query.select)
    : null;
  const where: any = !!request.query?.where
    ? JSON.parse(request.query.where)
    : null;
  let prismaQuery: PrismaQuery = {
    select,
    where,
  };
  // DOC remove null where clause, see prisma doc
  prismaQuery = removeEmptyObjectForPrismaQUery(prismaQuery);
  return await (prisma[name as any] as any)[route.action](prismaQuery);
};
