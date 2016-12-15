'use strict'

const TeleBot = require('telebot')
const db = require('./db')
const locale = require('./locale')
const cfg = require('../config')

const bot = new TeleBot({
    token: cfg.token,
    webhook: {
        url: cfg.webhook,
        port: process.env.PORT || cfg.port
    }
})

bot.use(require('./modules/ask.js'))

bot.on('/start', msg => {
    const userId = msg.from.id

    return bot.sendMessage(userId, locale.START_INFO)
})

bot.on('sticker', (msg) => {
    if (msg.chat && msg.chat.type !== 'private') {
        return
    }

    const userId = msg.from.id
    const stickerId = msg.sticker && msg.sticker.file_id
    const stickerEmoji = msg.sticker && msg.sticker.emoji

    if (!stickerId) {
        return bot.sendMessage(userId, locale.NO_STICKER)
    }

    return db.getStickerTags(userId, stickerId)
        .then(tags => {
            const hasTags = tags && tags.length

            let newMessage = hasTags ? locale.CURRENT_TAGS_INFO.replace('{{tags}}', tags.join(' ')) : ''

            newMessage += locale.TYPE_NEW_TAGS_INFO.replace('{{emoji}}', stickerEmoji)
            newMessage += hasTags ? locale.DELETE_INFO : ''
            newMessage += locale.CANCEL_INFO

            return bot.sendMessage(userId, newMessage, {ask: 'tag', stickerId})
        })
})

bot.on('ask.tag', msg => {
    const userId = msg.from.id
    const stickerId = msg.opt.stickerId

    const text = msg.text &&
        msg.text.toLocaleLowerCase()
            .replace(/\s+/g, ' ')
            .trim() || null

    const tags = text && text.indexOf('/') !== 0 ? text.split(' ') : []

    if (text === '/cancel' || !tags || !tags.length) {
        return sendMessage(locale.CANCELED)
    }
    else if (text === '/delete') {
        return db.deleteSticker(userId, stickerId)
            .then(sendMessage.bind(null, locale.DELETED))
    }
    else {
        return db.saveTags(userId, stickerId, tags)
            .then(sendMessage.bind(null, locale.SAVED))
    }

    function sendMessage(message) {
        return bot.sendMessage(userId, message)
    }
})

bot.on('inlineQuery', msg => {
    let userId = msg.from.id
    let query = msg.query
    let filterTags = query && query.split(' ') || []

    return db.getStickersByTags(userId, filterTags)
        .then(sendStickers)

    function sendStickers(stickerIds) {
        const answers = bot.answerList(msg.id, {
            cacheTime: 30,
            personal: true
        })

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
