const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.films, kb.home.cinemas],
        [kb.home.favourite]
    ],
    films: [
        [kb.film.random, kb.film.fantastic],
        [kb.film.action, kb.film.Fantasy, kb.film.comedy],
        [kb.film.Drama, kb.film.Horror],
        [kb.back]
    ]
}