const removeEmptyOrUndefinedValueFromObject = (obj: any): any => {
  type ObjKey = keyof typeof obj;

  // DOC remove item if null or undefined value
  (Object.keys(obj) as ObjKey[]).forEach((key: string) => {
    if (obj[key as ObjKey] === null || obj[key as ObjKey] === undefined) {
      delete obj[key as ObjKey];
    }
  });
  return obj;
};

const removeEmptyObjectForPrismaQuery = (prismaQuery: any): any => {
  type PrismaQueryKey = keyof typeof prismaQuery;

  // DOC remove property if null (needed for prisma, select and where can't be null)
  (Object.keys(prismaQuery) as PrismaQueryKey[]).forEach(
    (key: PrismaQueryKey) => {
      if (prismaQuery[key]) {
        if (
          prismaQuery[key] === null ||
          Object.keys(prismaQuery[key]).length < 1
        ) {
          delete prismaQuery[key];
        }
      } else {
        delete prismaQuery[key];
      }
    }
  );
  return prismaQuery;
};

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
}

function notAnEmptyObject<TValue>(value: TValue): boolean {
  return JSON.stringify({}) !== JSON.stringify(value);
}

export {
  removeEmptyOrUndefinedValueFromObject,
  removeEmptyObjectForPrismaQuery,
  notEmpty,
  notAnEmptyObject,
};
