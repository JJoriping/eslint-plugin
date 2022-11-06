"use strict";
var fs_1 = require("fs");
var path_1 = require("path");
var all_1 = require("./configs/all");
var rules = (0, fs_1.readdirSync)((0, path_1.resolve)(__dirname, "rules"));
var fileNamePattern = /^(.+)\.js$/;
module.exports = {
    rules: rules.reduce(function (pv, v) {
        var chunk = v.match(fileNamePattern);
        if (!chunk)
            return pv;
        pv[chunk[1]] = require("./rules/".concat(v))['default'];
        return pv;
    }, {}),
    configs: {
        all: all_1.default
    }
};
