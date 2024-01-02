import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import backend from "i18next-http-backend";

i18n
  .use(detector)
  .use(backend)
  .init({
    fallbackLng: "en", // use en if detected lng is not available
    saveMissing: true // send not translated keys to endpoint
  });

export default i18n;