const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.films, kb.home.cinemas],
        [kb.home.favourite]
    ],
    films: [
        [kb.film.random],
        [kb.film.action, kb.film.comedy],
        [kb.film.Drama, kb.film.Horror],
        [kb.film.Fantasy, kb.film.Melodrama]
        [kb.back]
    ]
}