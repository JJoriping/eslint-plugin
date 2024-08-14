import { readdirSync } from "fs";
import { resolve } from "path";
import type { ESLint, Rule } from "eslint";

import all from "./configs/all";

const rules = readdirSync(resolve(__dirname, "rules"));
const fileNamePattern = /^(.+)\.js$/;
const plugin:ESLint.Plugin = {
  rules: rules.reduce((pv, v) => {
    const chunk = v.match(fileNamePattern);
    if(!chunk) return pv;
    pv[chunk[1]] = require(`./rules/${v}`)['default'];
    return pv;
  }, {} as Record<string, Rule.RuleModule>),
  configs: {
    all
  }
};

Object.assign(all.plugins, { '@daldalso': plugin });
export = plugin;