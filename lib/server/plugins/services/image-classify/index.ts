import { readFileSync } from "fs";
import type tfnode from "@tensorflow/tfjs-node";

// keep require, tfjs doesn't work with import
const tfnodeDyn = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");

const BASE_PATH =
  "https://d1zv2aa70wpiur.cloudfront.net/tfjs_quant_nsfw_mobilenet/";
const IMAGE_SIZE = 224; // default to Mobilenet v2

// add https://github.com/infinitered/nsfwjs#node-js-app

const NSFW_CLASSES: {
  [classId: number]: "Drawing" | "Hentai" | "Neutral" | "Porn" | "Sexy";
} = {
  0: "Drawing",
  1: "Hentai",
  2: "Neutral",
  3: "Porn",
  4: "Sexy",
};

export default async (job: any, logger: any) => {
  const params = job.data;
  try {
    const image = readFileSync(params.in);
    //  Supports BMP, GIF, JPEG and PNG formats.
    const decodedImage = tfnodeDyn.node.decodeImage(image, 3);
    const model = await mobilenet.load();
    const predictions = await model.classify(decodedImage as tfnode.Tensor3D);
    //cleanup tsf memory
    decodedImage.dispose();
    //@TODO translate in target langages
    return { predictions: { en: predictions } };
  } catch (error) {
    throw error;
  }
};
