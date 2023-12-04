import Joi from "joi";

const StringSchema = Joi.string();
const DateTimeSchema = Joi.date();
const BooleanSchema = Joi.boolean();
const JsonSchema = Joi.object();

export { StringSchema, DateTimeSchema, BooleanSchema, JsonSchema};
