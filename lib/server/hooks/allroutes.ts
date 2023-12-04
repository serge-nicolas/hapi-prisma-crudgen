import { excludeFieldsForResult } from "../common/filterResults";
import { AfterHook, hooks } from "../common/hook";

hooks.register(new AfterHook("*", excludeFieldsForResult));

export { hooks };
