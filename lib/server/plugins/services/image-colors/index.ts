import { extractColors } from "extract-colors";
import sharp from "sharp";
import type { Logger } from "winston";

export default async (job: any, logger: Logger): Promise<object> => {
  const params = job.data;
  try {
    const data: Buffer = await sharp(params.in).toBuffer();
    const pixelArray: Uint8ClampedArray = new Uint8ClampedArray(data.buffer);
    const colors = await extractColors({ data: pixelArray });
    return { input: job.data, result: colors };
  } catch (error) {
    throw error;
  }
};
