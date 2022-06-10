module.exports = {
    logStart() {
        console.log('Bot has been started ...')
    },
    getChatId(message) {
        return message.chat.id
    },
    getItemUuid(source) {
        return source.substr(2, source.length)
    }
}