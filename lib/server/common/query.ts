const removeEmptyObjectForPrismaQUery = (prismaQuery: any): any => {
  type PrismaQueryKeys = keyof typeof prismaQuery;

  // FEATURE remove property if null (needed for prisma, select and where can't be null)
  (Object.keys(prismaQuery) as PrismaQueryKeys[]).forEach((key: string) => {
    if (
      prismaQuery[key as PrismaQueryKeys] === null ||
      Object.keys(prismaQuery[key as PrismaQueryKeys]).length < 1
    ) {
      delete prismaQuery[key as PrismaQueryKeys];
    }
  });
  return prismaQuery;
};

export { removeEmptyObjectForPrismaQUery };
