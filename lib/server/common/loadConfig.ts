import YAML from "yaml-with-import";
import {
  join as pathJoin,
  dirname as pathDirname,
  resolve as pathResolve,
} from "node:path";
import { fileURLToPath } from "url";

/* try {
  var __filename = fileURLToPath(import.meta.url);
  var __dirname = pathDirname(__filename);
} catch (error) {} */

console.log(pathResolve(process.cwd()));

const currentDirname = pathResolve(process.cwd());

const yaml = YAML.default ? new YAML.default(): new YAML();

/**
 * singleton to load config file
 *
 * @class LoadConfig
 * @return object containing all config
 */
class LoadConfig {
  static instance: LoadConfig;
  loadedConfig: any = {};
  configFolder: string;
  constructor() {}
  static getInstance() {
    if (LoadConfig.instance) {
      return LoadConfig.instance;
    }
    LoadConfig.instance = new LoadConfig();
    return LoadConfig.instance;
  }
  loadFile(configFile: string, configFolder?: string) {
    if (!!configFolder) {
      this.configFolder = configFolder;
    }
    // load only once
    if (!!configFile && !this.loadedConfig.hasOwnProperty(configFile)) {
      try {
        console.log(this.configFolder,
          pathJoin(currentDirname, this.configFolder, `${configFile}.yaml`)
        );
        this.loadedConfig[configFile] = yaml.read(
          pathJoin(currentDirname, this.configFolder, `${configFile}.yaml`)
        );
      } catch (error: any) {
        throw error;
      }
    }
    return this;
  }
}

export default (_file: string, _folder: string = "./config"): any =>
  LoadConfig.getInstance().loadFile(_file, _folder).loadedConfig;
