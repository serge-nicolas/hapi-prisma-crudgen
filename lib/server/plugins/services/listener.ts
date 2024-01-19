/**
 * add from model prisma to queue
 */

import { PrismaClient } from "@prisma/client";
/**
 * Prisma pulse not available
 * @param prismaClient
 * @param model model to subscribe to (ex: tasks)
 * @param channel service name filter the tasks and send to queue
 */
const serviceListenerWithPulse = (
  prismaClient: PrismaClient,
  model: string,
  channel: string
) => {
  const subscription = prismaClient[model].subscribe({
    create: {
      after: {
        channel,
      },
    },
  });
};

/**
 * Graphql subscription need graphql plugin
 * @param prismaClient
 * @param model model to subscribe to (ex: tasks)
 * @param channel service name filter the tasks and send to queue
 */
const serviceListenerWithGraphql = (
  prismaClient: PrismaClient,
  model: string,
  channel: string
) => {
  const subscription = prismaClient[model].subscribe({
    create: {
      after: {
        channel,
      },
    },
  });
};

/**
 * Simple event sent on task created
 * @param prismaClient
 * @param model model to subscribe to (ex: tasks)
 * @param channel service name filter the tasks and send to queue
 */
const serviceListenerWithEvent = (
  prismaClient: PrismaClient,
  model: string,
  channel: string
) => {
    const event = new Event("taskcreated");

    
};

const serviceListener = serviceListenerWithEvent;

export { serviceListener };
