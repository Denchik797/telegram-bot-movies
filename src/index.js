const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helpers')
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')

helper.logStart()

const bot = new TelegramBot(config.TOKEN, {
    polling: true // Правильное взаимодействие с сервером 
})

bot.on('message', msg => {
    console.log('Working', msg.from.first_name, msg.from.last_name, msg.from.username, msg.from.language_code) // Вывод данных о пользователе, который ведёт общение с ботом 

    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.favourite:
            break
        case kb.home.films:
            bot.sendMessage(chatId, `Выберите жанр`, {
                
            })
            break
        case kb.home.cinemas:
            break
    }
})

// start bot
bot.onText(/\/start/, msg => {
    const text = `Здравствуйте, ${msg.from.first_name} ${msg.from.last_name}!\nЧто хотите посмотреть?`
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
}) 