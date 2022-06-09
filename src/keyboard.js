const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.films, kb.home.cinemas],
        [kb.home.favourite]
    ],
    films: [
        [kb.film.random],
        [kb.film.Drama, kb.film.fantastic, kb.film.Horror],
        [kb.back]
    ]
}