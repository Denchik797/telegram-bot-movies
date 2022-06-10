const TelegramBot = require('node-telegram-bot-api') // модуль для телеграма по созданию ботов
const mongoose = require('mongoose') // модуль для бд
const config = require('./config') // токен
const helper = require('./helpers') // функции
const kb = require('./keyboard-buttons') // кнопки 
const keyboard = require('./keyboard') // логика
const backendData = require('../database.json') // бд

helper.logStart()

mongoose.connect(config.DB_URL, { // подключение к бд
    // useMongoClient: true
})

    .then(() => console.log('MongoDB connected')) // сообщение о том, что подключение прошло успешно 
    .catch((err) => console.log(err)) // вывод ошибки 

// require models
require('./models/film.model') // модель фильмов

const Film = mongoose.model('films') // коллекция фильмов

// сохранение коллекции в бд
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

// find film by id
bot.onText(/\/f(.+)/, (msg, [source, match]) => {
    const filmUuid = helper.getItemUuid(source)
    console.log(filmUuid) // вывод в консоль id фильма 
})

// find all films by type
function sendFilmsByQuery(chatId, query) {
    Film.find(query).then(films => {
        const html = films.map((f, i) => {
            return `<b>${i + 1}.</b> ${f.name} —  /f${f.uuid}`
        }).join('\n')
        sendHtml(chatId, html, 'films')
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