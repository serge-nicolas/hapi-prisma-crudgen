import Joi from "joi";

interface FieldDefinition {
  [key: string]: string;
}
// TODO allow override
const validators = {
  asString: Joi.string(),
  asObjectId: Joi.string().hex().length(24),
  asRequiredObjectId: Joi.string().hex().length(24).required(),
  asRequiredEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  asEmail: Joi.string().email({ tlds: { allow: false } }),
};
/**
 * get validators for field list
 * 
 */
export default (fields: Array<FieldDefinition>) => {
  return (Object.keys(fields) as (keyof typeof fields)[]).map((fieldKey) => {
    const fieldValue = fields[fieldKey] as unknown as String;
    return {
      [fieldKey]:
        validators[
          (Object.keys(validators) as (keyof typeof validators)[]).find(
            (validator) => validator === fieldValue
          )
        ],
    };
  });
};
