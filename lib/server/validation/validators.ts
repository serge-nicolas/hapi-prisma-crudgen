import Joi from "joi";

const validators = {
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
const getValidationRuleForRoute = (route: any): any => {
  const rules: any = {};
  // get validation rules from config file
  if (route.options) {
    if (!!!route.options.validate) return {}; // if empty
    Object.keys(route.options.validate.payload).forEach((item: string) => {
      if (route.options.validate.payload[item]) {
        const ruleName: string = route.options.validate.payload[item];
        const validator: any =
          validators[ruleName as keyof typeof validators];
        Object.assign(rules, {
          [item]: validator,
        });
      }
    });
  }
  return rules;
};

export { getValidationRuleForRoute, validators };
