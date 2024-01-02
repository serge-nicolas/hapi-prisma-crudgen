import Joi from "joi";

import validators from "./validators";

interface FieldDefinition {
  [key: string]: string;
}

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
