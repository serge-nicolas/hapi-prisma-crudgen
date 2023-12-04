const pathConverter = (path: string): string => {
  if (path.includes("/")) {
    return path.replace("/", ",").replace(" /", " ");
  } else if (path.includes(",")) {
    return path.replace(",", "/").replace(" ", " /");
  } else {
    return path;
  }
};

const pathBuilder = (method: string, model: string, action: string, asFilePath:boolean = false): string => {
    if(asFilePath) return `${method.toUpperCase()} api,${action}`
    return `${method.toUpperCase} /api/${model}/${action}`;
}

export { pathConverter, pathBuilder };
