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

type Hook = {
  create?: Function;
  delete?: Function;
  update?: Function;
};

type HookList = {
  before: {
    create?: Function[];
    delete?: Function[];
    update?: Function[];
  };
  after: {
    create?: Function[];
    delete?: Function[];
    update?: Function[];
  };
};

class Resource {
  #name: string;
  #values: Array<any>;
  #query: PrismaQuery;
  #prisma: PrismaClient;
  #action: string;
  #client: any;
  #hooks: HookList = {
    before: {
      create: [],
      delete: [],
      update: [],
    },
    after: {
      create: [],
      delete: [],
      update: [],
    },
  };

  constructor(
    name: string,
    prisma: PrismaClient,
    action: string,
    rules: PrismaRules<PrismaRule>
  ) {
    this.#name = name;
    this.#prisma = prisma;
    this.#action = action;
    this.rules(rules);
  }
  //LINK see https://github.com/prisma/prisma-client-extensions/blob/main/obfuscated-fields/script.ts
  rules(fields: PrismaRules<PrismaRule>) {
    this.#client = this.#prisma.$extends({
      result: {
        [this.#name]: fields as any,
      },
    });
  }

  setBeforeHooks(hooks: Array<Hook>): void {
    hooks.forEach((hook) => {
      Object.keys(hook).forEach((action) => {
        this.#hooks.before[action].push(hook[action]);
      });
    });
  }

  setAfterHooks(hooks: Array<Hook>): void {
    hooks.forEach((hook) => {
      Object.keys(hook).forEach((action) => {
        this.#hooks.after[action].push(hook[action]);
      });
    });
  }

  validatePayload(data: any) {
    // TODO use Prisma validators https://www.prisma.io/docs/orm/prisma-client/type-safety/prisma-validator#combining-prismavalidator-with-form-input
    return true;
  }

  buildQuery(request: Hapi.Request): Resource {
    let query: PrismaQuery = { where: null, select: { id: true }, data: null };
    let select: any = [];
    // TODO improve empty detection
    if (notAnEmptyObject(request.query) && !!request.query) {
      // for route like : ?where='{"id": ""}'&select='["id","email"]'
      if (!!request.query.select) {
        const selectFields = JSON.parse(request.query.select).map(
          (key: string) => ({
            [key]: true,
          })
        );
        select = !!request.query?.select ? selectFields : null;
      }

      const where: any = !!request.query?.where
        ? JSON.parse(request.query.where)
        : null;
      Object.assign(
        query,
        { where: where },
        { select: Object.assign({}, ...select) }
      );
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
    this.#query = removeEmptyObjectForPrismaQuery(query);
    return this;
  }

  async executeAfterHooksOnAction(action: string) {}

  async execute() {
    // before hook
    if (this.#hooks.before[this.#action]) {
      this.#hooks.before[this.#action].forEach((f: Function) => {
        this.#query = f(this.#query) || this.#query;
      });
    }
    this.#values = await (this.#client[this.#name as any] as any)[this.#action](
      this.#query
    );
    // after hook
    if (this.#hooks.after[this.#action]) {
      this.#hooks.after[this.#action].forEach((f: Function) => {
        this.#values = f(this.#values) || this.#values;
      });
    }
    return this.#values || [];
  }

  set query(q: any) {
    this.#query = q;
  }

  set values(values: Array<any>) {
    this.#values = values;
  }
  get values(): Array<any> {
    return this.#values;
  }
  get name(): string {
    return this.#name;
  }
}

export default Resource;

export type { Hook, HookList };
