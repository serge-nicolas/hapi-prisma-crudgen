import { readFileSync } from "fs";

// @TODO improve ?
import type tfnode from "@tensorflow/tfjs-node"; //for type

// @WARNING keep require, tfjs doesn't work with import
const tfnodeDyn = require("@tensorflow/tfjs-node");
const cocoSsd = require("@tensorflow-models/coco-ssd");

export default async (job: any, logger: any) => {
  const params = job.data;
  try {
    // @TODO image convert to supported format before launching, with Bullmq flow
    const image = readFileSync(params.in);
    //  Supports BMP, GIF, JPEG and PNG formats.

    const decodedImage = tfnodeDyn.node.decodeImage(image, 3);
    const model = await cocoSsd.load();
    const objects = await model.detect(decodedImage as tfnode.Tensor3D);
    //cleanup tsf memory
    decodedImage.dispose();
    return { objects };
  } catch (error) {
    throw error;
  }
};
