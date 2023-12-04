interface PrismaActionMethod {
  action: string;
  handler: string;
  method: Array<string>;
  options: any;
  controler?: string;
  
}

interface HapiDefinedRoute {
  path: string;
  method: Array<string>;
  handler: Function;
  options: any;
  controler?: string;
}

export { PrismaActionMethod, HapiDefinedRoute };
