import { Worker, QueueEvents, Queue } from "bullmq";

/**
 * init queue
 *
 * @param {string} queueName path to controller
 * @param {Logger} logger winstion logger instance
 * @param {Function} callback function to launch on success
 * @return {*}  {Promise<string>}
 */
async function initQueue(
  service: any,
  logger: any,
  callback: Function
): Promise<string> {
  ///prepare
  const QUEUE = `${service.name}`;
  let controler: Function;
  try {
    controler = (await import(`./${QUEUE}`)).default;
  } catch (error) {
    throw error;
  }

  //start queue
  new Queue(QUEUE, {
    connection: {
      host: process.env.REDIS_HOST,
      port: +(process.env.REDIS_PORT || 32856),
    },
  });
  const queueEvents = new QueueEvents(QUEUE, {
    connection: {
      host: process.env.REDIS_HOST,
      port: +(process.env.REDIS_PORT || 32856),
    },
  });
  queueEvents.on("progress", ({ jobId, data }, timestamp) => {
    logger.info(
      `{${QUEUE.toUpperCase()}} ${jobId} reported progress ${data} at ${timestamp}`
    );
  });

  // initialize worker
  const workerConvert = new Worker(
    QUEUE,
    async (job) => {
      logger.info(`{${QUEUE.toUpperCase()}} job received ${job.id}`);
      return await controler(job, logger);
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: +(process.env.REDIS_PORT || 32856),
      },
    }
  );
  workerConvert.on("completed", async (job) => {
    logger.info(`{${QUEUE.toUpperCase()}} job completed ${job.id}`);
    callback();
  });

  workerConvert.on("failed", async (job) => {
    logger.info(
      `{${QUEUE.toUpperCase()}} job failed ${job?.id}: ${job?.stacktrace}`
    );
  });
  return `{${QUEUE.toUpperCase()}} ready`;
}
/**
 * add job to queue
 * job type depends on service
 * @param service 
 * @param job 
 */
const addToQueue = (service: any, job:any)=> {
    // bullmq add
}

export { initQueue, addToQueue };
