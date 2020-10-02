const { Aitu } = require('aitu')
const Reminder = require('./models/Reminder')
const { token } = require('../config')

const aitu = new Aitu({ token })

module.exports = async function () {
  const remindersToSend = await Reminder.find({ fireTime: { $lt: new Date() } })
  for (const r of remindersToSend) {
    // TODO: сделать тут await и не убирать напоминание из базы при ошибке отправления
    aitu.api.SendMessage({ content: `🔔 Вы просили меня напомнить ${r.note}`, recipient: { type: 'USER', id: r.user } })
    r.remove()
  }
}
