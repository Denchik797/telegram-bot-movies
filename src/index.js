const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const config = require('./config')
const helper = require('./helpers')
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')
const backendData = require('../database.json')

helper.logStart()

mongoose.connect(config.DB_URL, {
    // useMongoClient: true
})

    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

// require models
require('./models/film.model')

const Film = mongoose.model('films')

// backendData.films.forEach(f => new Film(f).save())

// Конец логического слоя

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
                reply_markup: {keyboard: keyboard.films}
            })
            break
        case kb.film.Horror:
            sendFilmsByQuery(chatId, {type: 'Horror'})
            break
        case kb.film.Drama:
            sendFilmsByQuery(chatId, {type: 'Drama'})
            break
        case kb.film.random:
            sendFilmsByQuery(chatId, {})
            break
        case kb.home.cinemas:
            break
        case kb.back:
            bot.sendMessage(chatId, `Что хотите посмотреть?`, {
                reply_markup: {keyboard: keyboard.home}
            })
    }
})

// start bot
bot.onText(/\/start/, msg => {
    const text = `Здравствуйте, ${msg.from.first_name} ${msg.from.last_name}!\nЧто хотите посмотреть?` // Приветствие
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home // Домашняя клавиатура
        }
    })
}) 

// find all films by type
function sendFilmsByQuery(chatId, query) {
    Film.find(query).then(films => {
        const html = films.map((f, i) => {
            return `<b>${i + 1}</b> ${f.name} - /f${f.uuid}`
        }).join('\n')
        sendHtml(chatId, html, 'home')
        bot.sendMessage(chatId, html, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: keyboard.films 
            }
        })
    })
}

// helper. send bot html
function sendHtml(chatId, html, keyboardName = null) {
    const options = {
        parse_mode: 'HTML'
    }
    if (keyboardName) {
        options['reply_markup'] = {
            keyboard: keyboard[keyboardName]
        }
    }
    bot.sendMessage(chatId, html, options)
}