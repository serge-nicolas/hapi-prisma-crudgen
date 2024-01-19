type InputConvertJob = {
  name: string; // for reference
  in: string; // file to convert
  out: {
    name: string;
    folder: string; // relative to "in" file
  };
  options: {
    width?: number; // set width or height or both
    height?: number;
    fit?: string; // wil default to contain - better than cover
  };
  emitter: {
    key: string; // id in database
    model: string; // table in database
  };
};

export type { InputConvertJob };
