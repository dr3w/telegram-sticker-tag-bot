'use strict'

const TeleBot = require('telebot')
const db = require('./db')
const cfg = require('../config')

const bot = new TeleBot({
    token: cfg.token,
    webhook: {
        url: cfg.webhook,
        port: cfg.port
    }
})

bot.use(require('./modules/ask.js'))

bot.on('/start', msg => {
    const userId = msg.from.id

    return bot.sendMessage(userId, 'Send me a sticker to tag')
})

bot.on('sticker', (msg) => {
    const userId = msg.from.id
    const stickerId = msg.sticker && msg.sticker.file_id

    if (!stickerId) {
        return bot.sendMessage(userId, 'Hm.. no... that\'s not right...')
    }

    return db.getStickerTags(userId, stickerId)
        .then(tags => {
            const hasTags = tags && tags.length;

            let newMessage = hasTags ?
            'You already have following tags:\n' + tags.join(' ') + '\n\n' : ''

            newMessage += 'Type in new tags for this sticker(space separated, emoji would also work 😜)\n\n'
            newMessage += hasTags ? '/delete - to delete tags for this sticker\n' : ''
            newMessage += '/cancel - to abort'

            return bot.sendMessage(userId, newMessage, {ask: 'tag', stickerId})
        })
})

bot.on('ask.tag', msg => {
    const userId = msg.from.id
    const stickerId = msg.opt.stickerId

    const text = msg.text && msg.text.toLocaleLowerCase().replace(/\s+/g, ' ').trim() || null
    const tags = text ? text.split(' ') : []

    if (text === '/cancel' || !tags || !tags.length) {
        return sendMessage('⛔️ Why nothing? Ok then... ¯\\_(ツ)_/¯')
    }
    else if (text === '/delete') {
        return db.deleteSticker(userId, stickerId)
            .then(sendMessage.bind(null, '💥 Ok, deleted'))
    }
    else {
        return db.saveTags(userId, stickerId, tags)
            .then(sendMessage.bind(null, '✅ Awesome! Saved!'))
    }

    function sendMessage(message) {
        return bot.sendMessage(userId, message);
    }
})

bot.on('inlineQuery', msg => {
    let userId = msg.from.id;
    let query = msg.query
    let filterTags = query && query.split(' ') || [];

    if (!filterTags.length) {
        return;
    }

    return db.getStickersByTags(userId, filterTags)
        .then(sendStickers)

    function sendStickers(stickerIds) {
        const answers = bot.answerList(msg.id, {cacheTime: 60})

        stickerIds && stickerIds.length && stickerIds.forEach(id => {
            answers.addSticker({
                id,
                sticker_file_id: id
            })
        })

        return bot.answerQuery(answers)
    }
})

module.exports = bot.connect.bind(bot)
