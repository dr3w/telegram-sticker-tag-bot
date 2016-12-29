const http = require('http')
const cfg = require('../config')

module.exports = function () {
    "use strict";

    console.log('Start keep-awake...');

    setInterval(function () {
        console.log('poll:', cfg.webhook);

        http.get(cfg.webhook);
    }, 300000); // every 5 minutes (300000)
}
