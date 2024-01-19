import sharp from "sharp";

export default async (job: any) => {
  const params = job.data;
  try {
    await sharp(params.in, params.options)
      .resize(params.options.width || null, params.options.height || null, {
        fit: params.options.fit || "contain",
      })
      .toFile(`${params.out.folder}/${params.out.name}`);
    return { ...job.id, data: { ...params, out: params.out } };
  } catch (error) {
    throw error;
  }
};
