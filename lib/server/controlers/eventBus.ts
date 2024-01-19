import { createClient } from "redis";

// topic > channel > message

type EventBusMessage = string;
type EventBusSubscription = {};

const client = createClient();
try {
  await client.connect();
} catch (e) {
  console.error(e);
}

const _subscriber = client.duplicate();
const _publisher = client.duplicate();

client.on("error", (err) => console.log("Redis Client Error", err));

/**
 *
 * @param onChannel
 * @param callback
 */
const subscriber = (onChannel: string, callback: Function) => {
  _subscriber.subscribe(
    onChannel,
    (message) => callback(onChannel, message),
    true
  );
};

/**
 * send message on opened client
 * @param channel
 * @param message :EventBusMessage
 */

const publish = async (channel: string, message: EventBusMessage) => {
  if (_publisher.isOpen) await _publisher.publish(channel, message);
  else console.error("client closed", channel);
};

export { subscriber, publish };

export type { EventBusMessage, EventBusSubscription };
