import { readdirSync } from "fs";
import { resolve } from "path";

import all from "./configs/all";

const rules = readdirSync(resolve(__dirname, "rules"));
const fileNamePattern = /^(.+)\.js$/;

export = {
  rules: rules.reduce((pv, v) => {
    const chunk = v.match(fileNamePattern);
    if(!chunk) return pv;
    pv[chunk[1]] = require(`./rules/${v}`)['default'];
    return pv;
  }, {} as Record<string, unknown>),
  configs: {
    all
  }
};