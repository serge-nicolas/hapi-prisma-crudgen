interface GenericCrudHandler {
  [key: string]: {
    path: string;
    method: string;
    handler: Function;
    validate: {
      payload: any
    }
  };
}

export type { GenericCrudHandler };
