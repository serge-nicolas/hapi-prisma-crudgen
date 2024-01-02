/*
default model for resource, should be extended
*/
import type Hapi from "@hapi/hapi";

import {
  notAnEmptyObject,
  notEmpty,
  removeEmptyObjectForPrismaQuery,
} from "../common/helpers/cleaners";
import type { PrismaClient } from "@prisma/client";
import {
  PrismaQuery,
  PrismaRule,
  PrismaRules,
  RequestPayload,
  RequestPayloadPut,
} from "../typings/server";

const noop: Function = () => {};

class Resource {
  _name: string;
  _values: Array<any>;
  _query: PrismaQuery;
  _prisma: PrismaClient;
  _action: string;
  _client: any;

  constructor(
    name: string,
    prisma: PrismaClient,
    action: string,
    rules: PrismaRules<PrismaRule>
  ) {
    this._name = name;
    this._prisma = prisma;
    this._action = action;
    this.rules(rules);
  }
  //LINK see https://github.com/prisma/prisma-client-extensions/blob/main/obfuscated-fields/script.ts
  rules(fields: PrismaRules<PrismaRule>) {
    this._client = this._prisma.$extends({
      result: {
        [this._name]: fields as any,
      },
    });
  }

  async setBeforeHooks(funcs: Array<Function> = [noop]): Promise<any> {
    // something to execute before
    const fPromises: Array<Function> = [];
    funcs.forEach(async (f: Function) => {
      fPromises.push(await f(this.values));
    });

    return fPromises.length > 0
      ? await Promise.all(fPromises)
      : await Promise.all([]);
  }

  async setAfterHooks(funcs: Array<Function> = [noop]): Promise<any> {
    // something to execute before
    const fPromises: Array<Function> = [];
    funcs.forEach(async (f: Function) => {
      fPromises.push(await f(this.values));
    });

    return fPromises.length > 0
      ? await Promise.all(fPromises)
      : await Promise.all([]);
  }

  validatePayload(data: any) {
    // TODO use Prisma validators https://www.prisma.io/docs/orm/prisma-client/type-safety/prisma-validator#combining-prismavalidator-with-form-input
    return true;
  }

  buildQuery(request: Hapi.Request): Resource {
    console.log("query", request.query, request.params);
    let query: PrismaQuery = { where: null, select: { id: true }, data: null };
    if (notAnEmptyObject(request.query)) {
      // for route like : ?where='{"id": ""}'&select='["id","email"]'
      const select: any = !!request.query?.select
        ? JSON.parse(request.query.select)
        : null;
      const where: any = !!request.query?.where
        ? JSON.parse(request.query.where)
        : null;
      Object.assign(query, { where: where }, { select: select });
    }
    if (notAnEmptyObject(request.params)) {
      // for route with params
      Object.assign(query, { where: request.params });
    }

    if (notAnEmptyObject(request.payload)) {
      if (this.validatePayload(request.payload as RequestPayload)) {
        Object.assign(query, {
          data: request.payload as RequestPayloadPut,
        });
      }
    }
    // need to remove empty or {} for prisma (where === {} throws prisma error), see prisma doc
    this._query = removeEmptyObjectForPrismaQuery(query);
    return this;
  }

  async execute() {
    // this.beforeHook();
    this._values = await (this._client[this._name as any] as any)[this._action](
      this._query
    );
    // this.afterHook();
    return this._values || [];
  }

  set query(q: any) {
    this._query = q;
  }

  set values(values: Array<any>) {
    this._values = values;
  }
  get values(): Array<any> {
    return this._values;
  }
  get name(): string {
    return this._name;
  }
}

export default Resource;
