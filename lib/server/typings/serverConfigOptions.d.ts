interface ServerConfigOptions {
  configFileServer: string;
  configFolder: string;
  overrides: any;
  plugins?: Array<any>,
  server?:any
  css?: string;
}

export default ServerConfigOptions;
