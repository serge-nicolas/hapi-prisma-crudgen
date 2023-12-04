/**
 * 
 *   var lng = request.language // 'de-CH'
    var lngs = v.languages // ['de-CH', 'de', 'en']
    request.i18n.changeLanguage('en') // will not load that!!! assert it was preloaded

    var exists = request.i18n.exists('myKey')
    var translation = request.t('myKey')
 * 
 */

import Hapi, { ReqRefDefaults } from "@hapi/hapi";
import i18next from "i18next";
import { LanguageDetector, handle } from "i18next-http-middleware";

/**
 *
 *
 * @param {Array<string>} [languages=["en"]]
 * @return {*}  {*}
 */
const translatePlugin = (languages: Array<string> = ["en"]): any => {
  i18next.use(LanguageDetector).init({
    preload: languages,
  });

  const plugin: Hapi.Plugin<null> = {
    pkg: {
      name: "i18n-middleware",
    },
    register: async function (server: Hapi.Server, options: any) {
      options.attachLocals = true;
      const middleware = handle(options.i18next, {
        ...options,
      });
      server.ext("onPreAuth", (request: any, h:Hapi.ResponseToolkit) => {
        /* middleware(
          request,
          request.raw.res || h.response() || request.response,
          () => h.continue
        ); */
        return h.continue;
      });
    },
  };

  return plugin;
};

export default translatePlugin;
