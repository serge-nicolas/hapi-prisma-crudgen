const removeEmptyObjectForPrismaQUery = (prismaQuery: any): any => {
  type PrismaQueryKeys = keyof typeof prismaQuery;

  // DOC remove property if null (needed for prisma, select and where can't be null)
  (Object.keys(prismaQuery) as PrismaQueryKeys[]).forEach((key: string) => {
    if (prismaQuery[key as PrismaQueryKeys] === null) {
      delete prismaQuery[key as PrismaQueryKeys];
    }
  });
  return prismaQuery;
};

export { removeEmptyObjectForPrismaQUery };
