# Description
This plugin for Hapi is a POC of a schema first autogenerated CRUD backend using:
- Prisma
- Hapi
- Tailwind

The goal is to reduce the amount of code needed to build something new with allowing to overwrite everything from the default build (ie: postgis search).

The plugin provides:
- pug templates
- default config in YAML
- generator for all needed routes

The tool is in early development and not ready (for anything...).

Every part of the tool will have a configuration file.

# Features
## Primary
- [ ] generate all needed routes (REST) from schema (GET, POST, DELETE) in Prisma flavour (excluding routes will be allowed)
- [ ] define Hapi plugin per model
- [ ] add specific routes (upload, ...)
- [ ] basic admin (table + forms)
- [ ] security: login, cors...
- [ ] hide sensible datas in the response (hook)
- [ ] file upload
- [ ] search
- [ ] build system
- [ ] design system if needed
- [ ] Joi schema validation (request, search params, pagination) against Prisma schema (+ extend)
- [ ] fullTextIndex / fullTextSearch
- [ ] content assets to create document

## Others
- [ ] microservices with BullMQ (Docker, Redis)
- [ ] documentation

## Roadmap
POC > alpha

# Prisma schema
```
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextIndex", "fullTextSearch"]
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

# Develop 
- yarn install
- setup .env file with your DB provider
- create your Prisma valid schema (can be splitted) in "./schema" folder or a folder defined in package.json

In 3 separate console:

```js
yarn dev:generate:prisma
yarn dev:generate:css
yarn dev:start
```

The backend is built in typescript, the front is currently in vanilla JS (so no SPA).

The file "sample.ts" shows th way to implement it. 

# Application
The front applicatino is here for demonstration purpose, it will be later build in Vue or React.

# Inspiration
KeytoneJS and AdminJS

https://github.com/Murked/vue-tailwind-admin

# To read

https://web.dev/articles/passkey-registration?hl=fr