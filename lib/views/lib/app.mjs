console.group("app started");

import { app } from "./core/app.js";

let APP;
APP = app.init("div[role=app-container]");

APP.listener.addEventListener("ready", (e) => {
  console.log("app ready");
});

window.APP = APP;

console.groupEnd();
