const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helpers')

helper.logStart()

const bot = new TelegramBot(config.TOKEN, {
    polling: true // Правильное взаимодействие с сервером 
})

bot.on('message', msg => {
    console.log('Working', msg.from.id, msg.from.first_name, msg.from.last_name, msg.from.username, msg.from.phone_number, msg.from.type, msg.from.language_code, msg.from.user_id)
})