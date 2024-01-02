import Joi from "joi";

export default {
  asString: Joi.string(),
  asObjectId: Joi.string().hex().length(24),
  asRequiredObjectId: Joi.string().hex().length(24).required(),
  asRequiredEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  asEmail: Joi.string().email({ tlds: { allow: false } }),
  from: Joi.number().required(),
  length: Joi.number().required(),
};
