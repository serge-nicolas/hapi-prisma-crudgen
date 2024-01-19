import type Hapi from "@hapi/hapi";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HapiAdapter } from "@bull-board/hapi";

import { Queue as QueueMQ, Worker } from "bullmq";

const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t * 1000));

async function setupBullMQProcessor(queueName) {
  new Worker(
    queueName,
    async (job) => {
      for (let i = 0; i <= 100; i++) {
        await sleep(Math.random());
        await job.updateProgress(i);
        await job.log(`Processing job at interval ${i}`);

        if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
      }

      return { jobId: `This is the return value of job (${job.id})` };
    },
    { connection: redisOptions }
  );
}

const redisOptions = {
  port: 6379,
  host: "localhost",
  password: "",
};

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: any;
    config: any;
  }
}

const createQueueMQ = (name: string) =>
  new QueueMQ(name, { connection: redisOptions });

const loggerPlugin: Hapi.Plugin<null> = {
  pkg: {
    name: "services",
  },
  dependencies: ["services", "config"],
  register: async function (server: Hapi.Server, options: any = {}) {
    const logger = server.app.logger;
    const config = server.app.config;

    const exampleBullMq = createQueueMQ("BullMQ");
    await setupBullMQProcessor(exampleBullMq.name);

    const serverAdapter = new HapiAdapter();

    createBullBoard({
      queues: [new BullMQAdapter(exampleBullMq)],
      serverAdapter,
    });

    serverAdapter.setBasePath("/ui");
    await server.register(serverAdapter.registerPlugin(), {
      routes: { prefix: "/ui" },
    });
  },
};

export default loggerPlugin;
