const request = require('request')
const cfg = require('../config')

module.exports = function () {
    "use strict"

    console.log('Start keep-awake...')

    setInterval(function () {
        const url = cfg.webhook + "/258025041:AAHE-xLxlDRfr26iYtuRM5aKNtWDcwSQywo"

        console.log('poll:', url);

        request.post(url, {}, (error, response, body) => {
            console.log('poll result:', error, response, body);
        })

    }, 300000); // every 5 minutes (300000)
}
