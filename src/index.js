const TelegramBot = require('node-telegram-bot-api') // модуль для телеграма по созданию ботов
const mongoose = require('mongoose') // модуль для бд
const config = require('./config') // токен
const helper = require('./helpers') // функции
const kb = require('./keyboard-buttons') // кнопки 
const keyboard = require('./keyboard') // логика
const backendData = require('../database.json') // бд
const { film } = require('./keyboard-buttons') 
const geolib = require('geolib') // модуль для работы с координатами
const _ = require('lodash') 

const ACTION_TYPE = {
    CINEMA_FILMS: 'cfs',
    FILM_CINEMAS: 'fcs',
    CINEMA_LOCATION: 'cl',
    FILM_TOGGLE_FAV: 'ftf'
}

helper.logStart()

mongoose.connect(config.DB_URL, { // подключение к бд
    // useMongoClient: true
})

    .then(() => console.log('MongoDB connected')) // сообщение о том, что подключение прошло успешно 
    .catch((err) => console.log(err)) // вывод ошибки 

// require models
require('./models/film.model') // модель фильмов
require('./models/cinema.model') // модель кинотеатров 
// модель пользователей отвечает за то, что тот с свою очередь добавляет в избранное 
require('./models/user.model') // модель пользователей 

const Film = mongoose.model('films') // коллекция фильмов
const Cinema = mongoose.model('cinemas') // коллекция кинотеатров
const User = mongoose.model('users') // модель пользователей

// сохранение коллекции в бд
// backendData.films.forEach(f => new Film(f).save()) 
// backendData.cinemas.forEach(c => new Cinema(c).save()) 

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
            bot.sendMessage(chatId, `Отправьте свое местоположение:`, {
                reply_markup: {
                    keyboard: [
                    [
                        {
                            text: 'Отправить местоположение',
                            request_location: true
                        }
                    ],
                    [kb.back]
                    ]
                }
            })
            break
        case kb.back:
            bot.sendMessage(chatId, `Что хотите посмотреть?`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break
    }
    if (msg.location){
        console.log(msg.location)
        if (msg.location) {
            sendCinemasInCords(chatId, msg.location)
        }
    }
})

// handler inline keyboard
bot.on('callback_query', query => {
    const userId = query.from.id
    let data
    try {
        data = JSON.parse(query.data)
    } catch (e) {
        throw new Error('Data is not a object')
    }
    const { type } = data
    if (type === ACTION_TYPE.CINEMA_LOCATION) {

    } else if (type === ACTION_TYPE.FILM_TOGGLE_FAV) {

    } else if (type === ACTION_TYPE.CINEMA_FILMS) {

    } else if (type === ACTION_TYPE.FILM_CINEMAS) {

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
    const chatId = helper.getChatId(msg)
    Promise.all([Film.findOne({uuid: filmUuid}), User.findOne({telegramId: msg.from.id})])
    .then(([film, user]) => {
        let isFavourite = false
        if (user) {
            isFavourite = user.films.indexOf(film.uuid) !== -1
        }
        const favouriteText = isFavourite ? 'Удалить из избранного' : 'Добавить в избранное'
    })
    // console.log(filmUuid) вывод в консоль id фильма 
    Film.findOne({uuid: filmUuid}).then(film => {
        const caption = `Название: ${film.name}\nГод: ${film.year}\nСтрана: ${film.country}\nРейтинг: ${film.rate}\nКоличество проголосовавших: ${film.ratingVoteCount}\nДлинна: ${film.length}`
        // console.log(film) вывод в консоль данных о фильме
        bot.sendPhoto(msg.chat.id, film.picture, {
            caption: caption,
            reply_markup: {
                inline_keyboard: 
                [
                    [
                        {
                            text: favouriteText,
                            callback_data: JSON.stringify ({
                                type: ACTION_TYPE.FILM_TOGGLE_FAV,
                                filmUuid: film.uuid,
                                isFav: isFavourite
                            })
                        },
                        {
                            text: " Показать кинотеатры",
                            callback_data: JSON.stringify ({
                                type: ACTION_TYPE.FILM_CINEMAS,
                                cinemaUuids: film.cinemas
                            })
                        }
                    ],
                    [
                        {
                            text: `Кинопоиск: ${film.name}`,
                            url: film.link
                        }
                    ]
                ]
            }
        })
    })
})


// find cinema by id
bot.onText(/\/c(.+)/, (msg, [source, match]) => {
    const cinemaUuid = helper.getItemUuid(source)
    Cinema.findOne({uuid: cinemaUuid}).then(cinema => {
        bot.sendMessage(helper.getChatId(msg), `Перейти на сайт кинотеатра:`, {
        reply_markup: {
            inline_keyboard: [
                [
                        {
                            text: cinema.name,
                            url: cinema.url
                        },
                    {
                        text: `Показать на карте`,
                        callback_data: JSON.stringify ({
                            type: ACTION_TYPE.CINEMA_LOCATION,
                            lat: cinema.location.latitude,
                            lon: cinema.location.longitude,
                        })
                    }
                ],
                [
                    {
                        text: `Показать фильмы`,
                        callback_data: JSON.stringify ({
                            type: ACTION_TYPE.CINEMA_FILMS,
                            filmUuids: cinema.films
                        })
                    }
                ]
            ]
        }
    }).catch(err => console.log(err))
    })
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

// find cinemas with cords
// find cinemas with cords
function sendCinemasInCords(chatId, location) {
    Cinema.find({}).then(cinemas => {
        cinemas.forEach(c => {
        c.distance = geolib.getDistance(location, c.location) / 1000
    })
    cinemas = _.sortBy(cinemas, 'distance')
    const html = cinemas.map((c, i) => {
        return `<b>${i + 1}</b> ${c.name}. <em>Расстояние</em> - <strong>${c.distance}</strong> км. /c${c.uuid}`
    }).join('\n')
    sendHtml(chatId, html, 'home')
    })
}