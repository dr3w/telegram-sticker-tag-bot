/*
 Name: Ask (modified)
 Description: Get direct answers from users!
 */

// Store user list
const userList = {}

module.exports = bot => {
    // On every text message
    bot.on(['text', 'sticker'], msg => {
        let id = msg.chat.id,
            opt = userList[id]

        // If no question, then it's a regular message
        if (!opt || !opt.ask) return

        msg.opt = opt;

        // Delete user from list and send custom event
        delete userList[id]

        bot.event('ask.' + opt.ask, msg, this, opt)
    })

    // Before call sendMessage method
    bot.on('sendMessage', args => {
        let id = args[0],
            opt = args[2] || {}

        let ask = opt.ask

        // If "ask" in options, add user to list
        if (ask) userList[id] = opt
    })

    // cancel
    bot.on('/cancel', args => {
        let id = args[0]

        delete userList[id]
    })
}
