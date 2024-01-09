interface PrismaActionMethod {
  action: string;
  handler: string;
  method: string;
  options: any;
  controler?: string;
}

interface HapiDefinedRoute {
  path: string;
  method: string;
  handler: Function;
  options: any;
  controler?: string;
}

type RequestPayload = {
  id: string;
  [key: string]: unknown;
};

type RequestPayloadPut = Omit<RequestPayload, "id">;

interface PrismaQuery {
  select?: any;
  where?: any;
  data?:any;
}
type PrismaRule = {
  needs: any;
  compute: Function;
};
interface PrismaRules<T> {
  [key: string]: T;
}

export {
  PrismaActionMethod,
  HapiDefinedRoute,
  RequestPayload,
  RequestPayloadPut,
  PrismaQuery,
  PrismaRule,
  PrismaRules
};
