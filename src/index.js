const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helpers')

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})