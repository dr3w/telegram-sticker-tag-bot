const https = require('https')
const cfg = require('../config')

module.exports = function () {
    "use strict"

    console.log('Start keep-awake...')

    setInterval(function () {
        console.log('poll:', cfg.webhook);

        https.get(cfg.webhook);
    }, 1000 * 60 * 5); // every 5 minutes (300000)
}
