import _ from "lodash";
import { AxiosAdapter } from "./axios-adapter";

export * from "./interface";

export const API = new AxiosAdapter({
  mapKeys: {
    from: _.camelCase,
    to: _.snakeCase,
  },
});
