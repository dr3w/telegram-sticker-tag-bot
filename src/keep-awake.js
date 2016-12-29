const http = require('http')
const cfg = require('../config')

module.exports = function () {
    "use strict";

    setInterval(function () {
        http.get(cfg.webhook);
    }, 300000); // every 5 minutes (300000)
}
