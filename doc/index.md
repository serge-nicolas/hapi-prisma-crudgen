/lib/server/common/helpers/cleaners.ts
  4,3:   // FEATURE remove item if null or undefined value
  16,3:   // FEATURE remove property if null (needed for prisma, select and where can't be null)

/lib/server/common/filterResults.ts
  4,3:   // FEATURE create specific type for this response
  7,3:   // FEATURE remove data values if hidden (like password fields)

/lib/server/common/query.ts
  4,3:   // FEATURE remove property if null (needed for prisma, select and where can't be null)

/lib/server/controlers/createPluginForModel.ts
  41,3:   // FEATURE find key in prisma no matter the case

/lib/server/plugins/excludeFieldsForResultPlugin.ts
  34,9:         // FEATURE exclude not items data files etc.

/lib/server/plugins/prisma.ts
  26,1: // FEATURE instantiate Prisma Client
  66,7:       // FEATURE get actions from prisma

/lib/server/generator.ts
  2,34: import Inert from "@hapi/inert"; // FEATURE needed for frontend
  63,5:     // FEATURE load hapi plugin defined by overrides
  99,7:       // FEATURE use predefined admin
  103,7:       // FEATURE serve ui client

/lib/view/lib/core/app.js
  35,7:       // FEATURE initial load of page

/lib/view/lib/ui/renderers/form.js
  109,68:     const parent = document.querySelector(`${target} .form-body`); // FEATURE retrieve node from target

/lib/view/register.ts
  1,36: import Vision from "@hapi/vision"; // FEATURE needed for pug frontend
  40,9:         // FEATURE parse req params to find page, id..., only one parameter (see path)
  52,9:         // FEATURE add meta to all request results
  58,9:         // FEATURE get data to add to responses
  70,11:           // FEATURE get data by internal action instead of get
  93,3:   // FEATURE serve assets
  107,3:   // FEATURE serve assets

/sample.ts
  34,3:   // FEATURE install logger in app.logger
  38,3:   // FEATURE WIP
  43,6: /*   // FEATURE pretty error reporting, see https://www.npmjs.com/package/hapi-dev-errors
  54,3:   // FEATURE register the core plugin