import _ from "lodash";
import { AxiosAdapter } from "./axios-adapter";

export const API = new AxiosAdapter({
  mapKeys: {
    from: _.camelCase,
    to: _.snakeCase,
  },
});
